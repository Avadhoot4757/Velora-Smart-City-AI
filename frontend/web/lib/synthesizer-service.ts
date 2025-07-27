export interface SynthesizerRequest {
  incidentId: string;
  title: string;
  description: string;
  location: string;
  verifiedAt: string;
}

export interface SynthesizerAlert {
  alertId: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export async function synthesizeAlert(request: SynthesizerRequest): Promise<SynthesizerAlert | null> {
  try {
    const response = await fetch('https://us-central1-velora-demo.cloudfunctions.net/synthesizer-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to synthesize alert');
    return await response.json();
  } catch (e) {
    console.error('Synthesizer error:', e);
    return null;
  }
} 