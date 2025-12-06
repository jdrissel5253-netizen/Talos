#!/usr/bin/env python3
"""
Script to replace scoring matrices in resumeAnalyzer.js with unified rubric calls.
"""

import re

# Define the functions to update with their parameters
FUNCTIONS_TO_UPDATE = [
    # (function_name, includeCerts, end_marker)
    ("getDispatcherCriteria", False, "=== FLEXIBILITY PENALTY APPLICATION ==="),
    ("getServiceTechnicianCriteria", True, "=== EVALUATION INSTRUCTIONS ==="),
    ("getApprenticeCriteria", True, "=== FINAL INSTRUCTIONS ==="),
    ("getBookkeeperCriteria", False, "=== FINAL INSTRUCTIONS ==="),
    ("getSalesRepCriteria", True, "=== FLEXIBILITY PENALTY ==="),
    ("getWarehouseAssociateCriteria", True, "=== FINAL INSTRUCTIONS ==="),
    ("getLeadHVACTechnicianCriteria", True, "=== EVALUATION INSTRUCTIONS ==="),
    ("getAdminAssistantCriteria", False, "=== CRITICAL EVALUATION RULES ==="),
    ("getCustomerServiceRepCriteria", False, "=== CRITICAL EVALUATION RULES ==="),
]

def update_function(content, func_name, include_certs, end_marker):
    """Replace the scoring matrix in a function with the unified rubric call."""

    # Pattern to find the scoring matrix section
    matrix_start = r"^=== DETAILED SCORING MATRIX ===$"

    # Find the function and its matrix
    lines = content.split('\n')
    new_lines = []
    in_function = False
    in_matrix = False
    func_found = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # Detect when we enter the target function
        if f"function {func_name}" in line:
            in_function = True
            func_found = True
            print(f"Found {func_name} at line {i+1}")

        # Detect the matrix start
        if in_function and line.strip() == "=== DETAILED SCORING MATRIX ===":
            in_matrix = True
            # Add the unified rubric call
            new_lines.append(f"${{generateUnifiedScoringRubric(requiredYears, {'true' if include_certs else 'false'})}}")
            new_lines.append("")  # blank line
            print(f"  Replacing matrix at line {i+1}")
            i += 1
            continue

        # Skip lines while in matrix until we hit the end marker
        if in_matrix:
            if line.strip() == end_marker:
                in_matrix = False
                in_function = False
                new_lines.append(line)
                print(f"  Matrix ends at line {i+1}")
            i += 1
            continue

        # Keep all other lines
        new_lines.append(line)
        i += 1

    if not func_found:
        print(f"WARNING: Function {func_name} not found!")

    return '\n'.join(new_lines)

def main():
    file_path = r"C:\Users\13019\talos-website\backend-node\services\resumeAnalyzer.js"

    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print("Starting replacements...\n")

    # Update each function
    for func_name, include_certs, end_marker in FUNCTIONS_TO_UPDATE:
        content = update_function(content, func_name, include_certs, end_marker)
        print()

    # Write the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("All replacements complete!")
    print(f"Updated {len(FUNCTIONS_TO_UPDATE)} functions")

if __name__ == "__main__":
    main()
