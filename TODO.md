# TODO: Fix Case Creation to Simulation Flow Issues

## Issues to Fix:
- Routing bugs: /simulation/start and /simulation/replay not defined
- Start button doesn't start new simulation
- Replay not working
- No live simulation component
- Review page not in main flow
- PDF download error
- Backend stuck in status check during submit

## Steps:
- [x] Fix routing in App.jsx: Add routes for /simulation/start/:caseId and /simulation/replay/:caseId
- [x] Create LiveSimulation.jsx component for real-time simulation display
- [x] Modify CaseForm.jsx to navigate to review page instead of process
- [x] Update ReviewScreen.jsx to navigate to live simulation after confirm
- [x] Update dashboard.jsx button handlers to use correct routes
- [x] Fix PDF generation in backend report_generator.py
- [x] Fix backend status update and polling issues
- [ ] Test the complete flow
