# Backend Refactoring Tasks

## Completed: VisionService Optimization
- [x] Update Blip2Processor.from_pretrained to include use_fast=True
- [x] Replace torch_dtype with dtype in Blip2ForConditionalGeneration.from_pretrained
- [x] Add logging warning if GPU is not available after device detection
- [x] Test the updated service to verify warnings are resolved and GPU usage if available
- [x] Update TODO.md with completion status

## Current Work: Backend Code Refactoring
Refactoring backend for better maintainability, security, and performance.

## Key Technical Concepts
- Function decomposition (breaking large functions into smaller ones)
- Configuration management
- File upload security (MIME types, size limits, unique filenames)
- Code organization and separation of concerns

## Relevant Files and Code
- backend/routes/simulation_route.py: Long start_courtroom_simulation function
- backend/services/parsing/document_parsing_services.py: Hardcoded file size limit
- backend/routes/upload.py: Missing security validations
- backend/config.py: Basic config without validation

## Problem Solving
- Break monolithic function into focused methods
- Use centralized configuration for limits
- Add proper file validation and security measures
- Improve error handling and logging

## Pending Tasks and Next Steps
1. [x] Refactor start_courtroom_simulation into smaller functions (analyze_evidence, generate_simulation, create_reports, save_simulation_results)
2. [x] Update document_parsing_services.py to use Config.MAX_CONTENT_LENGTH
3. [x] Enhance upload.py with MIME type checking and unique filename generation
4. [x] Add validation to config.py for required environment variables
5. [x] Test simulation functionality after refactoring
6. [x] Verify file upload security improvements
7. [x] Run document parsing tests with various file types
8. [x] Update TODO.md with completion status
