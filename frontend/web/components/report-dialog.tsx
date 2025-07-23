"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, MapPin, AlertTriangle, Car, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const [reportType, setReportType] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const handleSubmit = async () => {
    if (!reportType || !location || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a report.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get idToken for the current user
      const idToken = await user.getIdToken()

      // Prepare media (base64-encoded) if a file is selected
      let media = null
      let mediaType = null
      if (file) {
        const reader = new FileReader()
        const promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        const dataUrl = await promise
        media = dataUrl.split(',')[1] // Extract base64 part
        mediaType = file.type.includes('image') ? 'photo' : 'video'
      }

      // Prepare request body
      const requestData = {
        description,
        reportType,
        geoLocation: location,
        media,
        mediaType,
      }

      // Send POST request to manage_reports
      const response = await fetch('https://asia-south1-city-pulse-813ee.cloudfunctions.net/manage_reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      toast({
        title: "Report Submitted!",
        description: "You earned 10 points! Your report is being reviewed.",
      })

      // Reset form
      setReportType("")
      setLocation("")
      setDescription("")
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting the report.",
        variant: "destructive",
      })
    }
  }

  const reportTypes = [
    { value: "traffic", label: "Traffic Issue", icon: Car },
    { value: "civic", label: "Civic Issue", icon: AlertTriangle },
    { value: "event", label: "Event/Closure", icon: Calendar },
    { value: "other", label: "Other", icon: MapPin },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Submit Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="location"
                placeholder="Enter location or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attach Photo or Video (Optional)</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Earn Points:</strong> Submit reports (+10 pts), Get verified (+15 pts bonus)
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
