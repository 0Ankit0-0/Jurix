# User Guide: Live Courtroom Simulation

## Quick Start

### Starting a Simulation
1. Create a case with title and description
2. (Optional) Upload evidence documents
3. Click "Start Simulation"
4. Watch the live simulation unfold in real-time

## Understanding the Interface

### Live Simulation View

#### Header Section
```
┌─────────────────────────────────────────────────────┐
│ Live Simulation                    [Download Report] │
│ Case ID: 12345                                       │
└─────────────────────────────────────────────────────┘
```

#### Progress Indicator (During Simulation)
```
Progress: ████████████░░░░░░░░ 60%
Step 2: Processing court simulation...
```

#### Turn Display
Each turn shows:
- **Role Badge**: Judge (blue), Prosecutor (red), Defense (green)
- **Turn Number**: Sequential numbering
- **Live Badge**: Appears on the most recent turn during live simulation
- **Timestamp**: Time of the statement
- **Thinking Process**: The AI's reasoning (in blue gradient box)
- **Statement**: The actual courtroom statement

### Reading a Turn

```
┌─────────────────────────────────────────────────────┐
│ 🎭 Judge                    Turn 1         [Live]    │
│                                      09:00:00        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 💡 THINKING PROCESS                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                      │
│ "Reviewing case details and preparing to open       │
│  court with proper judicial authority. Need to      │
│  ensure fair proceedings for all parties..."        │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ STATEMENT                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                      │
│ Court is now in session. We will proceed with       │
│ this matter in an orderly fashion, ensuring all     │
│ parties receive due process under the law...        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Understanding Thinking Process

The thinking process shows you:
- **Why** the agent made this statement
- **What** factors they considered
- **How** they reached their conclusion

This helps you understand:
- Legal reasoning patterns
- Evidence evaluation methods
- Argumentation strategies
- Judicial decision-making

### Playback Controls (After Simulation Completes)

```
[▶ Play] [⟲ Reset] [Speed: 1x] Turn 5 of 15
```

- **Play/Pause**: Control the replay
- **Reset**: Start from the beginning
- **Speed**: Adjust playback speed (0.5x, 1x, 1.5x, 2x)
- **Turn Counter**: Shows current position

## Features

### 1. Ask Questions
Click "Ask Questions About This Case" to:
- Query specific evidence
- Ask about legal provisions
- Understand AI reasoning
- Get clarifications on arguments

### 2. Download Report
Click "Download Report" to get a formatted document with:
- Case metadata
- Full transcript with thinking processes
- Judge's final judgment
- Summary of arguments
- Legal references
- System metadata

### 3. Full Transcript
After simulation completes, scroll down to see:
- Complete formatted transcript
- All thinking processes
- Structured sections
- Professional formatting

## Tips for Best Experience

### During Live Simulation
✅ **Watch in real-time**: See how arguments develop
✅ **Read thinking processes**: Understand the reasoning
✅ **Take notes**: Jot down interesting points
✅ **Ask questions**: Use the Q&A feature for clarifications

### After Simulation
✅ **Review at your pace**: Use playback controls
✅ **Download report**: Save for future reference
✅ **Analyze patterns**: Look for argumentation strategies
✅ **Compare cases**: Run multiple simulations to compare

## Understanding the Agents

### Judge Agent (Blue)
- **Role**: Impartial arbiter
- **Thinking**: Focuses on fairness, legal standards, and due process
- **Statements**: Court management, evidence rulings, final judgment

### Prosecutor Agent (Red)
- **Role**: Represents the prosecution
- **Thinking**: Analyzes evidence, builds case, proves allegations
- **Statements**: Opening, evidence presentation, closing arguments

### Defense Agent (Green)
- **Role**: Represents the defendant
- **Thinking**: Challenges evidence, finds weaknesses, protects rights
- **Statements**: Opening, cross-examination, closing arguments

## Report Format

### Sections in Downloaded Report

1. **Case Metadata**
   - Case ID, title, date
   - Number of evidences
   - Submitted by

2. **Case Summary**
   - Case type
   - Brief facts
   - Key evidences

3. **Simulation Overview**
   - Simulation mode
   - AI agents used
   - Model information

4. **Transcript of Proceedings**
   - Full formatted transcript
   - Thinking processes marked with 💭
   - Speaker labels: [JUDGE], [PROSECUTOR], [DEFENSE]
   - Proper indentation and structure

5. **Judge's Final Judgment**
   - Verdict
   - Reasoning summary

6. **Summary of Arguments**
   - Argument strength analysis
   - Key highlights

7. **Legal References**
   - Applicable laws
   - Citations

8. **System Metadata**
   - Model version
   - Processing time
   - Timestamp

## Keyboard Shortcuts

- **Space**: Play/Pause (when simulation complete)
- **R**: Reset to beginning
- **S**: Change speed
- **Q**: Toggle questions panel
- **D**: Download report

## Troubleshooting

### Simulation Not Starting
- Check case has title and description
- Verify evidence uploaded correctly (if any)
- Refresh page and try again

### Slow Performance
- Close other browser tabs
- Check internet connection
- Try reducing playback speed

### Report Download Issues
- Check browser download settings
- Ensure popup blocker is disabled
- Try different browser

## Best Practices

### For Learning
1. **Read thinking processes carefully**: They contain valuable insights
2. **Compare different cases**: See how arguments vary
3. **Take notes**: Document interesting legal reasoning
4. **Ask follow-up questions**: Use Q&A feature extensively

### For Analysis
1. **Download reports**: Keep records for comparison
2. **Review multiple times**: Use replay feature
3. **Focus on patterns**: Look for common strategies
4. **Analyze evidence impact**: See how evidence affects arguments

### For Presentation
1. **Use professional reports**: Download formatted versions
2. **Highlight key points**: Note important reasoning
3. **Prepare explanations**: Understand the logic before presenting
4. **Have backup**: Save reports before presenting

## Advanced Features

### Real-Time Streaming
- Simulation uses WebSocket for live updates
- No page refresh needed
- Instant feedback as turns are generated

### Adaptive Speed
- System adjusts based on content length
- Longer statements get more time
- Maintains natural pacing

### Smart Formatting
- Automatic detection of thinking markers
- Intelligent section parsing
- Professional typography

## Getting Help

### In-App Support
- Hover over elements for tooltips
- Check status messages
- Review error notifications

### Documentation
- Read SIMULATION_IMPROVEMENTS.md for technical details
- Check TODO.md for known issues
- Review code comments for implementation details

## Feedback

We value your feedback! If you have suggestions for:
- New features
- UI improvements
- Bug reports
- Documentation updates

Please create an issue in the repository or contact the development team.

---

**Remember**: The simulation is an educational tool. While it provides realistic courtroom scenarios, it should not be used as legal advice. Always consult with qualified legal professionals for actual legal matters.

**Enjoy your courtroom simulation experience!** 🎭⚖️
