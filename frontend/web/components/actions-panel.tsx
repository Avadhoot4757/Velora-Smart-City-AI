// components/actions-panel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function ActionsPanel() {
  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Bengaluru Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-blue-600 font-medium">Bengaluru</span> wakes up to <span className="text-green-600">#PartlyCloudy</span> skies at 28°C, with a <span className="text-yellow-600">20% chance of showers</span> later this evening. Traffic is already building up around <span className="font-medium">#SilkBoard</span> and <span className="font-medium">#MGRoad</span>, worsened by metro work and reports of <span className="text-red-600">#WaterLogging</span> near KR Puram and Richmond Circle. Authorities warn of possible blockades on Residency and Brigade Road as an MLA visit is expected today, sparking chatter under <span className="text-purple-600">#MLARoute</span>. <span className="font-medium">#Koramangala</span> is buzzing with a tech meetup, while <span className="font-medium">#CubbonPark</span> gears up for tonight’s cultural fest. <span className="text-orange-600">BMTC</span> has launched new <span className="text-green-600">#eBus</span> routes to ease commutes, and officials recommend sticking to <span className="text-green-600">#PublicTransport</span> or <span className="text-green-600">#TwoWheelers</span> for quicker movement today. Social media trends to watch: <span className="text-pink-600">#BengaluruRains</span> • <span className="text-pink-600">#TechFest</span> • <span className="text-pink-600">#WaterLogging</span>. All insights live from civic feeds, user reports & trending posts.
          </p>
        </Card>
      </CardContent>
    </div>
  );
}
