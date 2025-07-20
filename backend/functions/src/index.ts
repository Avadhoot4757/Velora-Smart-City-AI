import * as functions from 'firebase-functions/v1'; // Explicitly use v1
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'city-pulse-813ee',
  storageBucket: 'city-pulse-813ee.appspot.com',
});

// Emulator setup for Firestore (Auth emulator is set via firebase.json)
admin.firestore().settings({ host: '127.0.0.1:8080', ssl: false });

const db = admin.firestore();
const storage = getStorage().bucket('city-pulse-813ee.appspot.com');

// Interface definitions
interface ReportData {
  userId: string;
  description: string;
  severity: number;
  status: 'verified' | 'pending' | null;
  likes: number;
  timestamp: admin.firestore.Timestamp;
  geoLocation?: { latitude: number; longitude: number };
  mediaUrl?: string;
}

interface ReportRequest {
  description: string;
  media?: string;
  mediaType?: 'photo' | 'video';
  geoLocation?: { latitude: number; longitude: number };
}

export const manageReports = functions
  .region('us-central1')
  .https.onRequest(async (req: functions.Request, res: functions.Response<any>) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    try {
      const authHeader = req.get('Authorization');
      console.log('Auth Header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No token provided');
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      console.log('ID Token:', idToken.substring(0, 10) + '...');

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Token verified, UID:', decodedToken.uid);
      } catch (error: any) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ error: `Unauthorized: Invalid token - ${error.message}` });
        return;
      }

      const userId = decodedToken.uid;

      if (req.method === 'GET') {
        const reportsSnapshot = await db
          .collection('reports')
          .where('userId', '==', userId)
          .get();

        const reports: ReportData[] = reportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as ReportData),
        }));

        res.status(200).json({ reports });
      } else if (req.method === 'POST') {
        const { description, media, mediaType, geoLocation }: ReportRequest = req.body;

        if (!description) {
          res.status(400).json({ error: 'Description is required' });
          return;
        }

        const reportData: ReportData = {
          userId,
          description,
          severity: 1,
          status: null,
          likes: 0,
          timestamp: Timestamp.now(),
          geoLocation,
        };

        let mediaUrl: string | undefined;

        if (media && mediaType) {
          const fileName = `${userId}/${Date.now()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}`;
          const file = storage.file(fileName);
          const buffer = Buffer.from(media, 'base64');

          await file.save(buffer, {
            metadata: { contentType: mediaType === 'photo' ? 'image/jpeg' : 'video/mp4' },
          });

          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2030',
          });

          mediaUrl = url;
          reportData.mediaUrl = mediaUrl;
        }

        const reportRef = await db.collection('reports').add(reportData);
        res.status(201).json({ id: reportRef.id, ...reportData });
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
