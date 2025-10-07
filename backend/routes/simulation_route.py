from flask import Blueprint, request, jsonify, send_file
import openai
import os
from datetime import datetime
from typing import List, Dict, Any, Union

# Project imports - adjust paths if needed
from model.case_model import get_case_by_id, update_case
from model.evidence_model import list_evidences
from services.parsing.document_parsing_services import master_parser

# AI agents (local)
from services.ai_services.ai_agents.prosecutor import ProsecutorAgent
from services.ai_services.ai_agents.defense import DefenseAgent
from services.ai_services.ai_agents.judge import JudgeAgent

# Config defaults (assumes you expose these from config.py or env)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
openai.api_key = OPENAI_API_KEY

simulation_bp = Blueprint("simulation", __name__)


# -------------------------
# Helpers
# -------------------------
def _now_utc_iso() -> str:
    return datetime.utcnow().isoformat()


def parse_simulation_into_turns(transcript: str) -> List[Dict[str, Any]]:
    """Parse simulation transcript into turn-by-turn format for replay"""
    turns = []
    lines = transcript.split('\n')
    
    current_role = None
    current_message = []
    turn_number = 0
    
    role_markers = {
        'JUDGE:': 'Judge',
        'PROSECUTOR': 'Prosecutor',
        'DEFENSE': 'Defense',
        'WITNESS': 'Witness',
        'COURT:': 'Court'
    }
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('=') or line.startswith('-'):
            continue
            
        # Check if line starts with a role marker
        role_found = None
        for marker, role in role_markers.items():
            if marker in line.upper():
                role_found = role
                # Extract message after role marker
                message_start = line.upper().find(marker) + len(marker)
                line = line[message_start:].strip()
                break
        
        if role_found:
            # Save previous turn
            if current_role and current_message:
                message_text = ' '.join(current_message).strip()
                if message_text:  # Only add if there's actual content
                    turns.append({
                        'turn_number': turn_number,
                        'role': current_role,
                        'message': message_text,
                        'timestamp': f"{9 + (turn_number // 4):02d}:{(turn_number * 15) % 60:02d}:00",
                        'duration': len(message_text) // 20 + 3  # Estimate duration based on length
                    })
                    turn_number += 1
            
            # Start new turn
            current_role = role_found
            current_message = [line] if line else []
        elif current_role and line:
            current_message.append(line)
    
    # Add last turn
    if current_role and current_message:
        message_text = ' '.join(current_message).strip()
        if message_text:
            turns.append({
                'turn_number': turn_number,
                'role': current_role,
                'message': message_text,
                'timestamp': f"{9 + (turn_number // 4):02d}:{(turn_number * 15) % 60:02d}:00",
                'duration': len(message_text) // 20 + 3
            })
    
    return turns


def analyze_case_evidence(case_id: str) -> Union[str, List[Dict[str, Any]]]:
    """Analyze and parse all evidence files for a case.
    Returns either a list of analyzed evidence dicts or an error string.
    """
    try:
        evidence_files = list_evidences({"case_id": case_id})
        if not evidence_files:
            return "No evidence files found for this case."

        analyzed_content = []
        for evidence in evidence_files:
            title = evidence.get("title", "Untitled")
            file_path = evidence.get("file_path")
            print(f"📄 Parsing evidence: {title} -> {file_path}")

            # master_parser might return long string or dict; keep a safe slice
            parsed = master_parser(file_path, use_multimodal_pdf=True)
            # Normalize parsed content into string
            if isinstance(parsed, dict):
                content_text = parsed.get("text") or parsed.get("content") or str(parsed)
            else:
                content_text = str(parsed)

            analyzed_content.append(
                {
                    "title": title,
                    "type": evidence.get("evidence_type", "unknown"),
                    "content": content_text[:4000],  # truncate to safe length
                    "summary": f"{title} - {evidence.get('description', '')}",
                    "source": file_path,
                }
            )
        return analyzed_content

    except Exception as e:
        print(f"❌ Error analyzing evidence: {e}")
        return f"Error analyzing evidence: {str(e)}"


def generate_openai_simulation(case_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Use OpenAI ChatCompletion to generate a simulation transcript.
    Returns dict with keys: transcript (str), meta (dict).
    """
    try:
        if not OPENAI_API_KEY:
            raise RuntimeError("OpenAI API key not configured.")

        evidence_summary = "\n".join([f"- {e['summary']}" for e in evidence_analysis])
        prompt = f"""
You are an AI judge conducting a courtroom simulation.

Case Details:
Title: {case_data.get('title')}
Type: {case_data.get('case_type')}
Description: {case_data.get('description')}
Plaintiff: Plaintiff
Defendant: Defendant

Evidence Summary:
{evidence_summary}

Please deliver a realistic courtroom simulation with:
1) Opening statements (plaintiff & defendant)
2) Evidence presentations (refer to the evidence bullets above)
3) Legal arguments
4) Final judgment with reasoning and any relevant precedents

Be structured and professional. Keep it educational.
"""
        resp = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an experienced judge conducting a fair and educational courtroom simulation."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=2000,
            temperature=0.7,
        )
        transcript = resp.choices[0].message.content
        return {"transcript": transcript, "meta": {"model": OPENAI_MODEL, "provider": "openai"}}

    except Exception as e:
        print(f"❌ OpenAI simulation error: {e}")
        # propagate error to caller to allow fallback
        raise


def generate_static_fallback(case_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Return a simple static educational simulation (no external APIs)."""
    transcript_lines = [
        f"COURTROOM SIMULATION — {case_data.get('title', 'Untitled Case')}",
        f"CASE DESCRIPTION: {case_data.get('description', '')}",
        "",
        "COURT IN SESSION",
        "Judge: Court is now in session for Plaintiff vs Defendant.",
        "",
        "OPENING STATEMENTS:",
        'Plaintiff Attorney: "We will show the evidence supports our claim."',
        'Defense Attorney: "We disagree and will challenge the evidence."',
        "",
        "EVIDENCE SUMMARY:"
    ]

    for i, ev in enumerate(evidence_analysis, start=1):
        transcript_lines.append(f"Evidence {i}: {ev.get('title')} ({ev.get('type')})")

    transcript_lines += [
        "",
        "LEGAL ARGUMENTS: Both sides present their points based on evidence.",
        "",
        "COURT'S DECISION: This is a simulated decision — further analysis may be required.",
        "",
        f"Simulation generated at: {_now_utc_iso()}",
    ]

    return {"transcript": "\n".join(transcript_lines), "meta": {"provider": "static_fallback"}}


def run_agent_simulation(case_data: Dict[str, Any], evidence_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Run local AI agents (Prosecutor, Defense, Judge) to build a transcript and thinking logs."""
    try:
        prosecutor = ProsecutorAgent()
        defense = DefenseAgent()
        judge = JudgeAgent()

        transcript = []
        transcript.append("=" * 60)
        transcript.append("COURT SESSION BEGINS")
        transcript.append("=" * 60)

        # Judge opening
        judge_open = judge.open_court(case_data)
        transcript.append(f"JUDGE: {judge_open}\n")

        # Prosecutor and Defense opening statements
        transcript.append("PROSECUTOR'S OPENING:")
        transcript.append(prosecutor.make_opening_statement(case_data, evidence_analysis))
        transcript.append("")

        transcript.append("DEFENSE'S OPENING:")
        transcript.append(defense.make_opening_statement(case_data, evidence_analysis))
        transcript.append("")

        # Evidence presentation (limit to first 5 for performance)
        transcript.append("EVIDENCE PRESENTATION:")
        for i, ev in enumerate(evidence_analysis[:5], start=1):
            pres = prosecutor.present_evidence(ev)
            cross = defense.cross_examine(ev.get("summary", ev.get("title", "evidence")))
            transcript.append(f"PROSECUTOR (Evidence {i}): {pres}")
            transcript.append(f"DEFENSE (Cross-exam): {cross}\n")

        # Closings
        summary_line = f"Case summary: {case_data.get('title')} — evidence items: {len(evidence_analysis)}"
        transcript.append("CLOSING ARGUMENTS:")
        transcript.append("PROSECUTOR: " + prosecutor.make_closing_argument(summary_line))
        transcript.append("DEFENSE: " + defense.make_closing_argument(summary_line))
        transcript.append("")

        # Judge decision
        judgment = judge.make_final_judgment(summary_line, str(evidence_analysis))
        transcript.append("COURT'S DECISION:")
        transcript.append(judgment)

        transcript.append("=" * 60)
        transcript.append("COURT SESSION ENDS")
        transcript.append("=" * 60)

        thinking = {
            "prosecutor_thoughts": prosecutor.get_thinking_process(),
            "defense_thoughts": defense.get_thinking_process(),
            "judge_thoughts": judge.get_thinking_process(),
        }

        return {
            "transcript": "\n".join(transcript),
            "thinking_processes": thinking,
            "meta": {"provider": "local_agents"},
        }

    except Exception as e:
        print(f"❌ Agent simulation error: {e}")
        raise


# -------------------------
# Routes
# -------------------------
@simulation_bp.route("/simulation/start/<case_id>", methods=["POST", "OPTIONS"])
def start_courtroom_simulation(case_id: str):
    if request.method == "OPTIONS":
        return "", 200

    try:
        print(f"🚀 Request to start simulation for case: {case_id}")
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({"error": "Case not found"}), 404

        # Allow simulation start from more states
        allowed_states = ["ready_for_simulation", "draft", "evidence_uploaded"]
        if case.get("status") not in allowed_states:
            return (
                jsonify(
                    {
                        "error": f'Case must be in one of these states: {", ".join(allowed_states)}',
                        "current_status": case.get("status"),
                        "allowed_states": allowed_states
                    }
                ),
                400,
            )

        # Step 1: analyze evidence (if any)
        print("🔍 Step 1/4: Analyzing evidence files...")
        evidence_analysis = []
        try:
            if case.get('has_evidence', False):  # Check if case was created with evidence flag
                evidence_analysis = analyze_case_evidence(case_id)
                if isinstance(evidence_analysis, str):
                    if "No evidence files found" in evidence_analysis:
                        print("ℹ️ No evidence files to analyze")
                    else:
                        return jsonify({"error": evidence_analysis}), 400
                else:
                    print(f"📊 Found {len(evidence_analysis)} evidence files to analyze")
            else:
                print("ℹ️ Case marked as no evidence required")
        except Exception as e:
            print(f"❌ Evidence analysis failed: {e}")
            return jsonify({"error": f"Failed to analyze evidence: {str(e)}"}), 500

        # Step 2: Try local agent simulation first
        print("🤖 Step 2/4: Running AI agent simulation...")
        try:
            sim_out = run_agent_simulation(case, evidence_analysis)
            simulation_type = sim_out.get("meta", {}).get("provider", "local_agents")
            print(f"✅ Agent simulation completed using {simulation_type}")
        except Exception as e_agent:
            print("⚠️ Agent simulation failed, falling back to OpenAI:", e_agent)
            # Step 3: Try OpenAI GPT fallback
            print("🔄 Step 3/4: Attempting OpenAI simulation...")
            try:
                openai_out = generate_openai_simulation(case, evidence_analysis)
                sim_out = {"transcript": openai_out["transcript"], "thinking_processes": {}, "meta": openai_out.get("meta", {})}
                simulation_type = "openai"
            except Exception as e_openai:
                print("⚠️ OpenAI fallback failed, using static fallback:", e_openai)
                print("📝 Step 4/4: Generating static simulation...")
                sim_out = generate_static_fallback(case, evidence_analysis)
                sim_out.setdefault("thinking_processes", {})
                simulation_type = "static_fallback"
                print("✅ Static simulation generated")

        # Step 4: Save simulation results into the case
        simulation_id = f"SIM_{case_id}_{int(datetime.utcnow().timestamp())}"
        transcript = sim_out.get("transcript")
        
        # Parse transcript into turn-by-turn format for replay
        turns = parse_simulation_into_turns(transcript)
        
        # Generate PDF report
        from services.ai_services.report_generator import generate_simulation_report
        
        def validate_simulation_results(results):
            """Validate simulation results before saving
            
            Args:
                results (dict): The simulation results to validate
                
            Returns:
                tuple: (is_valid, error_message)
            """
            required_fields = {
                'simulation_id': str,
                'simulation_text': str,
                'turns': list,
                'thinking_processes': dict,
                'evidence_analyzed': int,
                'simulation_type': str,
                'generated_at': datetime,
                'status': str
            }
            
            # Check required fields exist and have correct type
            for field, expected_type in required_fields.items():
                if field not in results:
                    return False, f"Missing required field: {field}"
                if not isinstance(results[field], expected_type):
                    return False, f"Invalid type for {field}: expected {expected_type}, got {type(results[field])}"
            
            # Validate turns format
            for turn in results['turns']:
                required_turn_fields = {'turn_number', 'role', 'message', 'timestamp', 'duration'}
                missing_fields = required_turn_fields - set(turn.keys())
                if missing_fields:
                    return False, f"Turn missing required fields: {missing_fields}"
            
            # Additional validation rules
            if not results['simulation_text'].strip():
                return False, "Simulation text cannot be empty"
                
            if not 0 <= results['evidence_analyzed'] <= 100:  # Reasonable limit
                return False, "Invalid evidence count"
                
            valid_types = {'local_agents', 'openai', 'static_fallback', 'hybrid'}
            if results['simulation_type'] not in valid_types:
                return False, f"Invalid simulation type: {results['simulation_type']}"
                
            if results['status'] not in {'completed', 'failed', 'partial'}:
                return False, f"Invalid status: {results['status']}"
            
            return True, None
            
        # Prepare simulation results with thinking processes
        simulation_results = {
            "simulation_id": simulation_id,
            "simulation_text": transcript,
            "turns": [],  # Will be populated below
            "thinking_processes": sim_out.get("thinking_processes", {}),
            "evidence_analyzed": len(evidence_analysis) if evidence_analysis else 0,
            "simulation_type": simulation_type,
            "generated_at": datetime.utcnow(),
            "status": "completed"
        }
        
        # Validate results before proceeding
        is_valid, error_message = validate_simulation_results(simulation_results)
        if not is_valid:
            print(f"❌ Invalid simulation results: {error_message}")
            return jsonify({"error": f"Invalid simulation results: {error_message}"}), 400
        
        # Process turns with thinking processes
        for turn in turns:
            turn_with_thinking = {
                **turn,
                "thinking_process": sim_out.get("thinking_processes", {}).get(turn["role"], "")
            }
            simulation_results["turns"].append(turn_with_thinking)
        
        # Try to generate detailed report using EnhancedReportGenerator
        detailed_report = None
        try:
            from services.document_Service.report_generator import EnhancedReportGenerator
            generator = EnhancedReportGenerator()
            detailed_report = generator.generate_comprehensive_report(case, simulation_results)
            print("✅ Detailed report generated successfully")
        except Exception as e:
            print(f"⚠️ Detailed report generation failed: {e}")
            detailed_report = None

        # Try to generate PDF report if reportlab is available
        pdf_path = None
        try:
            from services.ai_services.report_generator import generate_simulation_report
            pdf_filename = f"simulation_{simulation_id}.pdf"
            pdf_path = os.path.join(os.path.dirname(__file__), "..", "reports", pdf_filename)
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            generate_simulation_report(case, simulation_results, pdf_path)
            print("✅ PDF report generated successfully")
        except ImportError as e:
            print(f"⚠️ PDF generation skipped: {e}")
            pdf_path = None
        except Exception as e:
            print(f"⚠️ PDF generation failed: {e}")
            pdf_path = None
        
        # Prepare simulation document
        simulation_document = {
            "simulation_results": simulation_results,
            "status": "completed",
            "report_path": pdf_path,
            "detailed_report": detailed_report,
            "last_updated": datetime.utcnow()  # Add timestamp for tracking
        }

        # Save simulation results with retries
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                # Update the case document
                save_ok = update_case(case_id, simulation_document)
                if not save_ok:
                    print(f"❌ Failed to persist simulation results to DB (attempt {retry_count + 1}/{max_retries})")
                    retry_count += 1
                    continue

                # Verify the save by reading back
                updated_case = get_case_by_id(case_id)
                if not updated_case:
                    print(f"❌ Case not found after save (attempt {retry_count + 1}/{max_retries})")
                    retry_count += 1
                    continue

                # Check if simulation results exist and match
                saved_results = updated_case.get("simulation_results")
                if not saved_results:
                    print(f"❌ Simulation results not found after save (attempt {retry_count + 1}/{max_retries})")
                    retry_count += 1
                    continue

                # Verify key fields are present
                required_fields = ["simulation_id", "simulation_text", "turns", "status"]
                missing_fields = [field for field in required_fields if field not in saved_results]
                if missing_fields:
                    print(f"❌ Missing required fields in saved results: {missing_fields} (attempt {retry_count + 1}/{max_retries})")
                    retry_count += 1
                    continue

                print(f"✅ Simulation results verified in database after {retry_count + 1} attempts")
                break

            except Exception as e:
                print(f"❌ Error saving simulation (attempt {retry_count + 1}/{max_retries}): {e}")
                retry_count += 1

        if retry_count >= max_retries:
            return jsonify({"error": "Failed to save simulation results after multiple attempts"}), 500

        print("✅ Simulation finished and saved:", simulation_id)

        return (
            jsonify(
                {
                    "message": "Courtroom simulation completed successfully",
                    "case_id": case_id,
                    "simulation": {
                        "id": simulation_id,
                        "text": sim_out.get("transcript"),
                        "evidence_count": len(evidence_analysis),
                        "generated_at": simulation_document["simulation_results"]["generated_at"].isoformat(),
                        "type": simulation_type,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        print(f"❌ Simulation failed overall: {e}")
        return jsonify({"error": f"Simulation failed: {str(e)}"}), 500


@simulation_bp.route("/simulation/report/<case_id>", methods=["GET", "OPTIONS"])
def get_simulation_report(case_id: str):
    """Get the PDF report for a simulation"""
    if request.method == "OPTIONS":
        return "", 200
    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({"error": "Case not found"}), 404

        simulation_results = case.get("simulation_results")
        if not simulation_results:
            return jsonify({"error": "No simulation results found"}), 404

        report_path = simulation_results.get("report_path")

        # If report doesn't exist, generate it on demand
        if not report_path or not os.path.exists(report_path):
            print(f"📋 Generating report on demand for case: {case_id}")
            try:
                from services.ai_services.report_generator import generate_simulation_report
                simulation_id = simulation_results.get('simulation_id', f"SIM_{case_id}")
                pdf_filename = f"simulation_{simulation_id}.pdf"
                pdf_path = os.path.join(os.path.dirname(__file__), "..", "reports", pdf_filename)
                os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
                actual_path = generate_simulation_report(case, simulation_results, pdf_path)

                # Update the case with the new report path
                update_case(case_id, {"report_path": actual_path})

                report_path = actual_path
            except Exception as e:
                print(f"❌ Failed to generate report on demand: {e}")
                return jsonify({"error": "Failed to generate report"}), 500

        # Determine mimetype and filename based on file extension
        if report_path.endswith('.pdf'):
            mimetype = 'application/pdf'
            filename = f"simulation_report_{case_id}.pdf"
        elif report_path.endswith('.txt'):
            mimetype = 'text/plain'
            filename = f"simulation_report_{case_id}.txt"
        else:
            mimetype = 'application/octet-stream'
            filename = f"simulation_report_{case_id}"

        return send_file(
            report_path,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"❌ Error getting simulation report: {e}")
        return jsonify({"error": "Failed to get simulation report"}), 500

@simulation_bp.route("/simulation/results/<case_id>", methods=["GET", "OPTIONS"])
def get_simulation_results(case_id: str):
    if request.method == "OPTIONS":
        return "", 200
    try:
        case = get_case_by_id(case_id)
        if not case:
            print(f"❌ Case not found: {case_id}")
            return jsonify({"error": "Case not found"}), 404
            
        sim = case.get("simulation_results")
        if not sim:
            print(f"❌ No simulation results for case: {case_id}")
            return jsonify({"error": "No simulation results found for this case"}), 404
            
        # Log successful retrieval
        print(f"✅ Retrieved simulation results for case: {case_id}")
        
        # Return the simulation results
        return jsonify({
            "message": "Simulation results found",
            "case_id": case_id,
            "simulation": {
                "simulation_text": sim.get("simulation_text", ""),
                "turns": sim.get("turns", []),
                "thinking_processes": sim.get("thinking_processes", {}),
                "generated_at": sim.get("generated_at", ""),
                "status": sim.get("status", "completed")
            }
        }), 200
    except Exception as e:
        print(f"❌ Error getting simulation results: {e}")
        return jsonify({"error": "Failed to get simulation results"}), 500


@simulation_bp.route("/simulation/status/<case_id>", methods=["GET", "OPTIONS"])
def get_simulation_status(case_id: str):
    if request.method == "OPTIONS":
        return "", 200
    try:
        case = get_case_by_id(case_id)
        if not case:
            return jsonify({"error": "Case not found"}), 404

        evidence_files = list_evidences({"case_id": case_id})
        evidence_count = len(evidence_files)
        has_evidence = evidence_count > 0

        requirements = {
            "has_title": bool(case.get("title")),
            "has_description": bool(case.get("description")),
            "has_parties": True,  # Parties are now optional, using defaults
            "has_evidence": has_evidence,
            "current_status": case.get("status", "draft"),
        }

        ready = all([requirements["has_title"], requirements["has_description"], requirements["has_parties"]])  # Evidence is now optional

        warning = None
        if not requirements["has_evidence"]:
            warning = "No evidence uploaded. Consider adding evidence (documents or photos) for more accurate simulation results."

        recommendation = "Ready to simulate!" if ready else "Please complete all requirements first."
        if warning:
            recommendation += f" {warning}"

        # Check if simulation is completed
        simulation_results = case.get("simulation_results")
        completed = False
        progress = 0
        step = 0
        
        if simulation_results:
            sim_status = simulation_results.get("status", "")
            if sim_status == "completed":
                completed = True
                progress = 100
                step = 4 if has_evidence else 2
            elif sim_status == "processing":
                # Simulation is in progress
                progress = simulation_results.get("progress", 50)
                step = simulation_results.get("step", 2)
        
        return (
            jsonify(
                {
                    "case_id": case_id,
                    "ready_for_simulation": ready,
                    "requirements": requirements,
                    "evidence_count": evidence_count,
                    "recommendation": recommendation,
                    "warning": warning,
                    "has_evidence": has_evidence,
                    "completed": completed,
                    "progress": progress,
                    "step": step,
                }
            ),
            200,
        )
    except Exception as e:
        print(f"❌ Error checking simulation status: {e}")
        return jsonify({"error": "Failed to check simulation status"}), 500


@simulation_bp.route("/simulation/health", methods=["GET"])
def simulation_health_check():
    api_status = "✅ Available" if OPENAI_API_KEY else "⚠️ API key not configured"
    return (
        jsonify(
            {
                "status": "Simulation service is running",
                "openai_api": api_status,
                "document_parser": "✅ Available",
                "timestamp": _now_utc_iso(),
            }
        ),
        200,
    )
