import { useState, useCallback } from 'react'
import { verifierService, VerifierAgentRequest, VerifierAgentResponse, VerificationResult } from '@/lib/verifier-service'

export interface VerificationState {
  verifyingReports: Set<string>
  verificationResults: Map<string, VerifierAgentResponse>
  verificationProgress: Map<string, string>
  verificationHistory: Map<string, { timestamp: Date; result: VerifierAgentResponse }>
}

export function useVerification() {
  const [state, setState] = useState<VerificationState>({
    verifyingReports: new Set(),
    verificationResults: new Map(),
    verificationProgress: new Map(),
    verificationHistory: new Map(),
  })

  const startVerification = useCallback((reportId: string) => {
    setState(prev => ({
      ...prev,
      verifyingReports: new Set(prev.verifyingReports).add(reportId),
      verificationProgress: new Map(prev.verificationProgress).set(reportId, "Initializing verification..."),
    }))
  }, [])

  const updateProgress = useCallback((reportId: string, progress: string) => {
    setState(prev => ({
      ...prev,
      verificationProgress: new Map(prev.verificationProgress).set(reportId, progress),
    }))
  }, [])

  const completeVerification = useCallback((reportId: string, result: VerifierAgentResponse) => {
    setState(prev => {
      const newVerifyingReports = new Set(prev.verifyingReports)
      newVerifyingReports.delete(reportId)
      
      const newVerificationProgress = new Map(prev.verificationProgress)
      newVerificationProgress.delete(reportId)
      
      const newVerificationResults = new Map(prev.verificationResults)
      newVerificationResults.set(reportId, result)
      
      const newVerificationHistory = new Map(prev.verificationHistory)
      newVerificationHistory.set(reportId, {
        timestamp: new Date(),
        result,
      })
      
      return {
        ...prev,
        verifyingReports: newVerifyingReports,
        verificationProgress: newVerificationProgress,
        verificationResults: newVerificationResults,
        verificationHistory: newVerificationHistory,
      }
    })
  }, [])

  const clearVerification = useCallback((reportId: string) => {
    setState(prev => {
      const newVerifyingReports = new Set(prev.verifyingReports)
      newVerifyingReports.delete(reportId)
      
      const newVerificationProgress = new Map(prev.verificationProgress)
      newVerificationProgress.delete(reportId)
      
      const newVerificationResults = new Map(prev.verificationResults)
      newVerificationResults.delete(reportId)
      
      return {
        ...prev,
        verifyingReports: newVerifyingReports,
        verificationProgress: newVerificationProgress,
        verificationResults: newVerificationResults,
      }
    })
  }, [])

  const verifyReport = useCallback(async (request: VerifierAgentRequest): Promise<VerificationResult> => {
    const reportId = request.incidentId
    startVerification(reportId)
    
    try {
      updateProgress(reportId, "Calling verifier agent...")
      const result = await verifierService.verifyReport(request)
      
      if (result.success && result.data) {
        completeVerification(reportId, result.data)
      }
      
      return result
    } catch (error) {
      clearVerification(reportId)
      throw error
    }
  }, [startVerification, updateProgress, completeVerification, clearVerification])

  const getVerificationStats = useCallback(() => {
    const totalVerified = Array.from(state.verificationResults.values()).filter(r => r.verified).length
    const totalRejected = Array.from(state.verificationResults.values()).filter(r => !r.verified).length
    const totalProcessed = totalVerified + totalRejected
    const accuracyRate = totalProcessed > 0 ? (totalVerified / totalProcessed) * 100 : 0
    
    return {
      totalVerified,
      totalRejected,
      totalProcessed,
      accuracyRate: Math.round(accuracyRate),
      currentlyVerifying: state.verifyingReports.size,
    }
  }, [state.verificationResults, state.verifyingReports])

  return {
    ...state,
    verifyReport,
    startVerification,
    updateProgress,
    completeVerification,
    clearVerification,
    getVerificationStats,
  }
} 