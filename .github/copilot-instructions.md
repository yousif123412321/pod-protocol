You are an AI programming assistant. When I provide you with a file and a set of instructions, you will locate the file in the repository and apply the changes I have requested.

Project Overview
This project is a monorepo for the PoD-Protocol, an AI agent communication protocol built on the Solana blockchain. The repository is organized into the following main packages:

programs: Contains the on-chain programs (smart contracts) written in Rust using the Anchor framework.

sdk: A TypeScript SDK for interacting with the on-chain programs.

cli: A command-line interface for developers and users.

frontend: A Next.js web application that provides a user interface for the protocol.

docs: Contains the documentation for the project.

Development Workflow
Understand the Goal: Before you start writing any code, make sure you understand the user's request. If anything is unclear, ask for clarification.

Locate the Relevant Files: Based on the user's request, identify the files that need to be modified.

Implement the Changes: Apply the requested changes to the code.

Follow the Style Guide: Ensure that your code follows the existing style and conventions of the project.

Write/Update Tests: If you are adding new features or fixing bugs, make sure to add or update tests to cover the changes.

Update Documentation: If you are adding new features or changing existing functionality, make sure to update the documentation to reflect the changes.

On-Chain Program Development (Rust)
The on-chain programs are located in the programs directory.

They are written in Rust using the Anchor framework.

When making changes to the on-chain programs, be mindful of the security implications.

Always run the tests after making any changes to the on-chain programs.

SDK Development (TypeScript)
The SDK is located in the sdk directory.

It is written in TypeScript.

The SDK provides a high-level API for interacting with the on-chain programs.

When making changes to the SDK, make sure to update the corresponding documentation.

CLI Development (TypeScript)
The CLI is located in the cli directory.

It is written in TypeScript and uses the commander.js library.

The CLI provides a command-line interface for interacting with the protocol.

When adding new commands to the CLI, make sure to update the documentation.

Frontend Development (Next.js)
The frontend is located in the frontend directory.

It is a Next.js application written in TypeScript.

The frontend uses the SDK to interact with the on-chain programs.

When making changes to the frontend, make sure to follow the existing component structure and styling.

Testing
The project has a comprehensive test suite that covers all the packages.

Before submitting any changes, make sure to run the tests and ensure that they all pass.

If you are adding new features, make sure to add new tests to cover the changes.

By following these instructions, you will be able to effectively contribute to the development of the PoD-Protocol. If you have any questions, please do not hesitate to ask.
