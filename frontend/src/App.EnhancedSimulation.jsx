import { useState } from "react";
import "./index.css";
import ProcessingScreen from "./components/simulation/ProcessingScreen";
import LiveSimulation from "./components/simulation/LiveSimulation";
import ReplaySimulation from "./components/simulation/ReplaySimulation";
import CaseForm from "./components/Case/CaseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const App = () => {
  const [activeTab, setActiveTab] = useState("processing");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enhanced Simulation Components Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Preview of enhanced simulation components with real-time progress, typing indicators, and improved backgrounds.
            </p>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="live">Live Simulation</TabsTrigger>
                <TabsTrigger value="replay">Replay</TabsTrigger>
                <TabsTrigger value="caseform">Case Form</TabsTrigger>
              </TabsList>
              
              <TabsContent value="processing" className="mt-6">
                <div className="h-[600px] relative">
                  <ProcessingScreen />
                </div>
              </TabsContent>
              
              <TabsContent value="live" className="mt-6">
                <div className="h-[600px] relative overflow-auto">
                  <LiveSimulation />
                </div>
              </TabsContent>
              
              <TabsContent value="replay" className="mt-6">
                <div className="h-[600px] relative overflow-auto">
                  <ReplaySimulation />
                </div>
              </TabsContent>
              
              <TabsContent value="caseform" className="mt-6">
                <div className="h-[600px] relative overflow-auto">
                  <CaseForm />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;