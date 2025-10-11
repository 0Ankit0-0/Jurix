# Socket.IO Implementation for Live Simulation

## Backend Changes
- [x] Add flask-socketio to backend/requirements.txt
- [x] Update backend/app.py to initialize SocketIO with CORS
- [x] Modify backend/routes/simulation_route.py:
  - [x] Remove SSE /simulation/stream route
  - [x] In /simulation/start/<case_id>, emit SocketIO events during processing:
    - [x] Evidence parsing: emit 'evidence_progress' with file count, current file, progress %
    - [x] Simulation steps: emit 'simulation_progress' with step name, progress %
    - [x] Turns: emit 'turn' events for live updates
    - [x] Thinking: emit 'thinking' events
    - [x] Complete: emit 'complete' with results
  - [x] Add delays in evidence parsing and simulation steps for UX
  - [x] Use socketio.emit() to broadcast to clients connected to the case room

## Frontend Changes
- [x] Add socket.io-client to frontend/package.json
- [x] Update frontend/src/services/api.js to include SocketIO connection
- [x] Modify frontend/src/components/simulation/LiveSimulation.jsx:
  - [x] Connect to SocketIO on mount
  - [x] Join case room
  - [x] Listen for events: 'evidence_progress', 'simulation_progress', 'turn', 'thinking', 'complete', 'error'
  - [x] Update progress bars and display turns live
- [ ] Update frontend/src/components/simulation/SimulationFlow.jsx to use real progress from socket events
- [ ] Update frontend/src/components/simulation/ReviewScreen.jsx to show progress during simulation start with delays

## Testing
- [x] Install dependencies
- [x] Test SocketIO connection
- [x] Test live progress updates
- [x] Test turn-by-turn live display
- [x] Verify delays work for UX
