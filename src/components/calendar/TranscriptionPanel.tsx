import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Lightbulb, Target, Users } from "lucide-react";
import { AISummary } from "@/hooks/useMeetingRecordings";

interface TranscriptionPanelProps {
  transcription: string | null;
  aiSummary: AISummary | null;
  isLoading?: boolean;
}

export function TranscriptionPanel({
  transcription,
  aiSummary,
  isLoading,
}: TranscriptionPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-pulse">Processing...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transcription && !aiSummary) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Summary */}
      {aiSummary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              AI Meeting Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div>
              <p className="text-sm">{aiSummary.summary}</p>
            </div>

            {/* Key Topics */}
            {aiSummary.key_topics && aiSummary.key_topics.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Key Topics
                </p>
                <div className="flex flex-wrap gap-1">
                  {aiSummary.key_topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Decisions Made */}
            {aiSummary.decisions_made && aiSummary.decisions_made.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Decisions Made
                </p>
                <ul className="text-sm space-y-1">
                  {aiSummary.decisions_made.map((decision, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {decision}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Client Facts */}
            {aiSummary.client_facts && Object.keys(aiSummary.client_facts).some(
              (key) => {
                const value = aiSummary.client_facts[key as keyof typeof aiSummary.client_facts];
                return value && (Array.isArray(value) ? value.length > 0 : true);
              }
            ) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Client Insights
                </p>
                <div className="text-sm space-y-1">
                  {aiSummary.client_facts.retirement_date && (
                    <p>
                      <span className="text-muted-foreground">Retirement:</span>{" "}
                      {aiSummary.client_facts.retirement_date}
                    </p>
                  )}
                  {aiSummary.client_facts.risk_tolerance && (
                    <p>
                      <span className="text-muted-foreground">Risk Tolerance:</span>{" "}
                      {aiSummary.client_facts.risk_tolerance}
                    </p>
                  )}
                  {aiSummary.client_facts.financial_goals && aiSummary.client_facts.financial_goals.length > 0 && (
                    <p>
                      <span className="text-muted-foreground">Goals:</span>{" "}
                      {aiSummary.client_facts.financial_goals.join(", ")}
                    </p>
                  )}
                  {aiSummary.client_facts.life_events && aiSummary.client_facts.life_events.length > 0 && (
                    <p>
                      <span className="text-muted-foreground">Life Events:</span>{" "}
                      {aiSummary.client_facts.life_events.join(", ")}
                    </p>
                  )}
                  {aiSummary.client_facts.concerns && aiSummary.client_facts.concerns.length > 0 && (
                    <p>
                      <span className="text-muted-foreground">Concerns:</span>{" "}
                      {aiSummary.client_facts.concerns.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Follow-up Date */}
            {aiSummary.follow_up_date && (
              <div className="pt-2 border-t">
                <p className="text-sm">
                  <span className="text-muted-foreground">Suggested Follow-up:</span>{" "}
                  <span className="font-medium">{aiSummary.follow_up_date}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      {transcription && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <p className="text-sm whitespace-pre-wrap">{transcription}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
