// In frontend/web/components/some-component.tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase/config";

const functions = getFunctions(app, "asia-south1");
const getAllFirestoreData = httpsCallable(functions, "get_all_firestore_data");
const result = await getAllFirestoreData();
console.log(result.data);

const manageReports = httpsCallable(functions, "manage_reports");
const getResult = await manageReports({ method: "GET" });
console.log(getResult.data);
