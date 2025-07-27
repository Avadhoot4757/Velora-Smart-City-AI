# Verifier Agent Integration

This document describes the integration of the Verifier Agent API into the Velora Smart City AI dashboard.

## Overview

The Verifier Agent integration provides real-time AI-powered verification of incident reports submitted by citizens. The agent analyzes reports based on multiple factors including:

- Report content and description
- Reporter credibility (level and points)
- Evidence quality (photos, videos)
- Community engagement (upvotes, downvotes)
- Similar reports in the area
- Geographic and temporal patterns

## Components

### 1. VerifierService (`lib/verifier-service.ts`)

The main service class that handles communication with the Verifier Agent API.

**Features:**
- RESTful API communication with the verifier agent
- Request/response type definitions
- Error handling and fallback mechanisms
- Timeout protection (30 seconds)
- Streaming support for real-time updates

**API Endpoint:** `https://us-central1-velora-demo.cloudfunctions.net/verifier-agent`

### 2. useVerification Hook (`hooks/use-verification.ts`)

A custom React hook that manages verification state and provides a clean interface for components.

**Features:**
- State management for verification progress
- Verification history tracking
- Statistics calculation
- Progress updates
- Error handling

### 3. IncidentVerifier Component (`components/incident-verifier.tsx`)

The main UI component that displays reports and handles verification.

**Features:**
- Real-time verification status display
- Progress indicators during verification
- Detailed verification results
- Manual override capabilities
- Statistics dashboard

## Usage

### Basic Verification

```typescript
import { verifierService } from '@/lib/verifier-service'

const request = {
  incidentId: "RPT-001",
  title: "Pothole on MG Road",
  description: "Large pothole causing traffic issues",
  // ... other fields
}

const result = await verifierService.verifyReport(request)
if (result.success && result.data) {
  console.log('Verification result:', result.data)
}
```

### Using the Hook

```typescript
import { useVerification } from '@/hooks/use-verification'

function MyComponent() {
  const { verifyReport, verifyingReports, verificationResults } = useVerification()
  
  const handleVerify = async (report) => {
    const result = await verifyReport(report)
    // Handle result
  }
}
```

## API Response Format

The Verifier Agent returns the following structure:

```typescript
interface VerifierAgentResponse {
  verified: boolean;                    // Whether the report is verified
  confidence: number;                   // Confidence score (0-1)
  reasoning: string;                    // Explanation for the decision
  recommendations: string[];            // Suggested actions
  riskLevel: 'low' | 'medium' | 'high'; // Risk assessment
  requiresImmediateAction: boolean;     // Whether immediate action is needed
  estimatedResponseTime: number;        // Estimated response time in minutes
  suggestedPriority: 'low' | 'medium' | 'high' | 'critical'; // Priority level
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Automatic fallback to simulated verification
2. **Timeout Protection**: 30-second timeout to prevent hanging requests
3. **API Errors**: Graceful degradation with user-friendly error messages
4. **Fallback Mode**: When the agent is unavailable, provides reasonable defaults

## Fallback Behavior

When the Verifier Agent is unavailable, the system provides fallback verification:

- 70% verification rate for reports
- 85-95% confidence scores
- Reasonable risk assessments based on report severity
- Estimated response times based on severity levels

## Security Considerations

- All requests include proper authentication headers
- Input validation on all report data
- Rate limiting considerations
- Secure communication over HTTPS

## Performance Optimizations

- Request timeout protection
- Efficient state management
- Minimal re-renders through proper React patterns
- Caching of verification results

## Future Enhancements

1. **Streaming Verification**: Real-time progress updates
2. **Batch Processing**: Verify multiple reports simultaneously
3. **Advanced Analytics**: Detailed verification metrics
4. **Machine Learning**: Continuous improvement based on verification accuracy
5. **Integration with Other Agents**: Coordinate with dispatch and routing agents

## Troubleshooting

### Common Issues

1. **Agent Unavailable**: Check if the verifier agent endpoint is accessible
2. **Timeout Errors**: Verify network connectivity and agent response times
3. **Authentication Errors**: Ensure proper authentication headers are included
4. **Data Format Errors**: Validate request payload structure

### Debug Mode

Enable debug logging by setting the environment variable:
```
NEXT_PUBLIC_DEBUG_VERIFIER=true
```

This will log detailed information about verification requests and responses. 