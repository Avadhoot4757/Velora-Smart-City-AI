export interface SeverityRequest {
  incidentId: string;
  title: string;
  description: string;
  location: string;
  verifiedAt: string;
}

export interface SeverityResponse {
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100 or similar
  reason?: string;
}

export async function getSeverity(request: SeverityRequest): Promise<SeverityResponse | null> {
  try {
    const response = await fetch('https://us-central1-velora-demo.cloudfunctions.net/severity-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to get severity');
    return await response.json();
  } catch (e) {
    console.error('Severity agent error:', e);
    return null;
  }
} 