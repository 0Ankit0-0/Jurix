import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FormattedTranscript = ({ transcript }) => {
  // Parse the transcript into structured sections
  const parseTranscript = (text) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = { type: 'text', content: [] };

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and separators
      if (!trimmedLine || trimmedLine.match(/^[=]+$/)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
          currentSection = { type: 'text', content: [] };
        }
        return;
      }

      // Detect section headers
      if (trimmedLine.match(/^(COURT SESSION BEGINS|COURT SESSION ENDS)$/)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        sections.push({ type: 'header', content: trimmedLine });
        currentSection = { type: 'text', content: [] };
        return;
      }

      // Detect speaker lines (JUDGE:, PROSECUTOR:, DEFENSE:, etc.)
      const speakerMatch = trimmedLine.match(/^(JUDGE|PROSECUTOR|DEFENSE|COURT|WITNESS):\s*(.+)$/i);
      if (speakerMatch) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        sections.push({
          type: 'speaker',
          speaker: speakerMatch[1],
          content: speakerMatch[2]
        });
        currentSection = { type: 'text', content: [] };
        return;
      }

      // Detect section titles (all caps lines)
      if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && !trimmedLine.includes(':')) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        sections.push({ type: 'section-title', content: trimmedLine });
        currentSection = { type: 'text', content: [] };
        return;
      }

      // Regular text
      currentSection.content.push(trimmedLine);
    });

    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseTranscript(transcript);

  const getSpeakerBadgeVariant = (speaker) => {
    switch (speaker.toUpperCase()) {
      case 'JUDGE':
      case 'COURT':
        return 'default';
      case 'PROSECUTOR':
        return 'destructive';
      case 'DEFENSE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSpeakerColor = (speaker) => {
    switch (speaker.toUpperCase()) {
      case 'JUDGE':
      case 'COURT':
        return 'text-blue-700 dark:text-blue-300';
      case 'PROSECUTOR':
        return 'text-red-700 dark:text-red-300';
      case 'DEFENSE':
        return 'text-green-700 dark:text-green-300';
      default:
        return 'text-foreground';
    }
  };

  const getSpeakerBgColor = (speaker) => {
    switch (speaker.toUpperCase()) {
      case 'JUDGE':
      case 'COURT':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'PROSECUTOR':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'DEFENSE':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      default:
        return 'bg-muted/30 border-border/50';
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6 space-y-4">
        {sections.map((section, index) => {
          if (section.type === 'header') {
            return (
              <div key={index} className="text-center py-4">
                <div className="inline-block px-6 py-2 bg-primary/10 border-2 border-primary/30 rounded-lg">
                  <p className="text-lg font-bold text-primary uppercase tracking-wide">
                    {section.content}
                  </p>
                </div>
                <Separator className="mt-4" />
              </div>
            );
          }

          if (section.type === 'section-title') {
            return (
              <div key={index} className="pt-6 pb-2">
                <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide border-l-4 border-primary pl-3">
                  {section.content}
                </h3>
                <Separator className="mt-2" />
              </div>
            );
          }

          if (section.type === 'speaker') {
            return (
              <div key={index} className={`py-3 px-4 rounded-lg border ${getSpeakerBgColor(section.speaker)}`}>
                <div className="flex items-start gap-3">
                  <Badge variant={getSpeakerBadgeVariant(section.speaker)} className="mt-1 shrink-0">
                    {section.speaker}
                  </Badge>
                  <p className={`text-sm leading-relaxed flex-1 font-medium ${getSpeakerColor(section.speaker)}`}>
                    {section.content}
                  </p>
                </div>
              </div>
            );
          }

          if (section.type === 'text' && section.content.length > 0) {
            return (
              <div key={index} className="py-2 px-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content.join(' ')}
                </p>
              </div>
            );
          }

          return null;
        })}
      </CardContent>
    </Card>
  );
};

export default FormattedTranscript;