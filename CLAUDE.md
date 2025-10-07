# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a documentation repository for the OpenAI Video API (Sora). It contains comprehensive developer documentation for integrating with Sora's video generation capabilities.

## Repository Structure

- **openai-video-api-guide.md** - Complete API reference documentation including:
  - All video generation endpoints (create, remix, retrieve, list, delete, download)
  - Authentication and setup
  - Object schemas and status values
  - Python code examples (sync, async, batch processing)
  - Error handling patterns
  - Best practices for polling, resource management, and optimization

## Key API Concepts

### Video Generation Workflow
1. Create video job with `POST /videos` (returns immediately with job ID)
2. Poll status with `GET /videos/{video_id}` until status is "completed"
3. Download content with `GET /videos/{video_id}/content`
4. Optionally remix with `POST /videos/{video_id}/remix`

### Status Lifecycle
- `queued` → `processing` → `completed` (or `failed`/`cancelled`)
- Videos have expiration timestamps and should be downloaded before expiry

### Supported Models & Parameters
- Model: `sora-2` (default)
- Duration: 4-8 seconds (default: "4")
- Resolutions: `720x1280` (portrait), `1024x1808`, `1280x720` (landscape), `1808x1024`

## Working with This Repository

### When Adding Code Examples
- Use Python with the official `openai` library
- Include proper error handling with `OpenAIError`
- Show both sync (`OpenAI`) and async (`AsyncOpenAI`) patterns where relevant
- Add polling logic with timeouts for long-running operations
- Include resource cleanup (deleting old videos)

### Documentation Style
- API endpoints use REST format with clear parameter tables
- Code examples are complete and runnable
- Error handling is demonstrated with retry logic and exponential backoff
- Best practices section covers real-world usage patterns
