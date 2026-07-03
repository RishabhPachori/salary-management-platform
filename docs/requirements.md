# Salary Management Platform Requirements

## Goal

Build a web-based salary management system for an HR manager who manages salary records for 10,000 employees across multiple countries. The product should replace spreadsheet-heavy workflows with a structured system for updating employee compensation data and answering common salary-related questions quickly.

## Primary user

HR Manager

## Scope

The first version focuses on two jobs:

1. Manage employee salary records efficiently.
2. Understand how the organization pays people across countries, roles, and departments.

## In-scope features

- Employee directory with search and pagination
- Create employee record
- Edit employee record
- Delete employee record
- Salary insights by country
- Average salary by job title within a country
- Department-wise salary overview
- Seed script for 10,000 employee records
- Backend and frontend tests for core flows

## Non-functional requirements

- Must remain responsive with 10,000 seeded employees
- Must validate input on both client and server
- Must be easy to run locally and deploy
- Must have deterministic, understandable tests

## Deliberately out of scope

- Payroll processing
- Authentication and role-based access
- Approval workflows
- Historical salary revision tracking
- File import/export
- Employee self-service

## Reasoning

This assessment is best solved by narrowing scope to the highest-value HR workflows: maintaining accurate employee salary records and retrieving compensation insights quickly. Features like payroll, auth, and workflow automation are important in a real product but would dilute focus from the core engineering goals of data modeling, API design, reporting queries, usability, and code quality.
