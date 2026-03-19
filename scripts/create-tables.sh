#!/bin/bash
# Create/update all Vantage tables on Kapable Data API
# Idempotent — safe to run multiple times (PUT upsert behavior)

API="https://api.kapable.dev/v1/_meta/tables"
KEY="${KAPABLE_DATA_KEY:?Set KAPABLE_DATA_KEY env var}"
SUCCESS=0
FAIL=0

create_table() {
  local name="$1"
  local body="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X PUT -H "x-api-key: $KEY" -H "Content-Type: application/json" "$API/$name" -d "$body")
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo "  ✓ $name ($status)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "  ✗ $name (HTTP $status)"
    # Show error detail
    curl -s -X PUT -H "x-api-key: $KEY" -H "Content-Type: application/json" "$API/$name" -d "$body"
    echo ""
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Core Client Tables ==="

# 1. clients (expand existing 15 cols → full schema)
create_table "clients" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "profile_state", "col_type": "text", "nullable": false, "default_value": "Active"},
    {"name": "profile_type", "col_type": "text", "nullable": false, "default_value": "Client"},
    {"name": "client_type", "col_type": "text", "nullable": false, "default_value": "individual"},
    {"name": "title", "col_type": "text", "nullable": true},
    {"name": "first_name", "col_type": "text", "nullable": false},
    {"name": "surname", "col_type": "text", "nullable": false},
    {"name": "initials", "col_type": "text", "nullable": true},
    {"name": "preferred_name", "col_type": "text", "nullable": true},
    {"name": "id_number", "col_type": "text", "nullable": true},
    {"name": "passport_number", "col_type": "text", "nullable": true},
    {"name": "country_of_issue", "col_type": "text", "nullable": true},
    {"name": "person_type", "col_type": "text", "nullable": true},
    {"name": "nationality", "col_type": "text", "nullable": true},
    {"name": "gender", "col_type": "text", "nullable": true},
    {"name": "date_of_birth", "col_type": "text", "nullable": true},
    {"name": "language", "col_type": "text", "nullable": true},
    {"name": "race", "col_type": "text", "nullable": true},
    {"name": "religion", "col_type": "text", "nullable": true},
    {"name": "email", "col_type": "text", "nullable": true, "indexed": true},
    {"name": "work_email", "col_type": "text", "nullable": true},
    {"name": "cell_number", "col_type": "text", "nullable": true},
    {"name": "work_number", "col_type": "text", "nullable": true},
    {"name": "work_extension", "col_type": "text", "nullable": true},
    {"name": "home_number", "col_type": "text", "nullable": true},
    {"name": "fax_number", "col_type": "text", "nullable": true},
    {"name": "website", "col_type": "text", "nullable": true},
    {"name": "skype", "col_type": "text", "nullable": true},
    {"name": "facebook", "col_type": "text", "nullable": true},
    {"name": "linkedin", "col_type": "text", "nullable": true},
    {"name": "twitter", "col_type": "text", "nullable": true},
    {"name": "youtube", "col_type": "text", "nullable": true},
    {"name": "is_smoker", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_professional", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_hybrid_client", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "profession", "col_type": "text", "nullable": true},
    {"name": "occupation", "col_type": "text", "nullable": true},
    {"name": "industry", "col_type": "text", "nullable": true},
    {"name": "employer", "col_type": "text", "nullable": true},
    {"name": "disability_type", "col_type": "text", "nullable": true},
    {"name": "tax_number", "col_type": "text", "nullable": true},
    {"name": "tax_resident_country", "col_type": "text", "nullable": true},
    {"name": "residential_address", "col_type": "json", "nullable": true},
    {"name": "postal_address", "col_type": "json", "nullable": true},
    {"name": "preferred_contact", "col_type": "text", "nullable": true},
    {"name": "preferred_phone", "col_type": "text", "nullable": true},
    {"name": "preferred_email", "col_type": "text", "nullable": true},
    {"name": "otp_delivery_method", "col_type": "text", "nullable": true},
    {"name": "advisor", "col_type": "text", "nullable": true},
    {"name": "wealth_manager", "col_type": "text", "nullable": true},
    {"name": "household_group", "col_type": "text", "nullable": true},
    {"name": "relationship", "col_type": "text", "nullable": true},
    {"name": "rating", "col_type": "integer", "nullable": true},
    {"name": "sports_interests", "col_type": "json", "nullable": true},
    {"name": "is_pep", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_sanctioned", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "onboarding_status", "col_type": "text", "nullable": true, "default_value": "not_started"}
  ]
}'

# 2. client_relationships
create_table "client_relationships" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "related_client_id", "col_type": "uuid", "nullable": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "entity_type", "col_type": "text", "nullable": true},
    {"name": "identification", "col_type": "text", "nullable": true},
    {"name": "id_type", "col_type": "text", "nullable": true},
    {"name": "product_viewing_level", "col_type": "text", "nullable": true},
    {"name": "relationship_type", "col_type": "text", "nullable": true},
    {"name": "family_name", "col_type": "text", "nullable": true},
    {"name": "share_percentage", "col_type": "float", "nullable": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 3. client_contacts
create_table "client_contacts" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "job_title", "col_type": "text", "nullable": true},
    {"name": "company", "col_type": "text", "nullable": true},
    {"name": "email", "col_type": "text", "nullable": true},
    {"name": "phone", "col_type": "text", "nullable": true},
    {"name": "contact_type", "col_type": "text", "nullable": true},
    {"name": "notes", "col_type": "text", "nullable": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 4. client_views
create_table "client_views" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "viewed_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 5. client_notes
create_table "client_notes" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "interaction_type", "col_type": "text", "nullable": true, "default_value": "Note"},
    {"name": "subject", "col_type": "text", "nullable": true},
    {"name": "content", "col_type": "text", "nullable": true},
    {"name": "priority", "col_type": "text", "nullable": true, "default_value": "Medium"},
    {"name": "is_complete", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_visible_portal", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "completed_at", "col_type": "timestamp", "nullable": true},
    {"name": "responsible_user_id", "col_type": "uuid", "nullable": true},
    {"name": "owner_user_id", "col_type": "uuid", "nullable": true},
    {"name": "attachment_count", "col_type": "integer", "nullable": true, "default_value": 0},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 6. client_products
create_table "client_products" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "product_id", "col_type": "uuid", "nullable": true},
    {"name": "policy_number", "col_type": "text", "nullable": true},
    {"name": "role", "col_type": "text", "nullable": true, "default_value": "Owner"},
    {"name": "premium_amount", "col_type": "float", "nullable": true},
    {"name": "current_value", "col_type": "float", "nullable": true},
    {"name": "frequency", "col_type": "text", "nullable": true, "default_value": "Monthly"},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "start_date", "col_type": "text", "nullable": true},
    {"name": "end_date", "col_type": "text", "nullable": true},
    {"name": "value_updated_at", "col_type": "timestamp", "nullable": true},
    {"name": "adviser_id", "col_type": "uuid", "nullable": true},
    {"name": "is_linked", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notes", "col_type": "text", "nullable": true},
    {"name": "created_by", "col_type": "uuid", "nullable": true},
    {"name": "updated_by", "col_type": "uuid", "nullable": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 7. client_assets
create_table "client_assets" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "asset_type", "col_type": "text", "nullable": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "current_value", "col_type": "float", "nullable": true},
    {"name": "purchase_value", "col_type": "float", "nullable": true},
    {"name": "purchase_date", "col_type": "text", "nullable": true},
    {"name": "growth_rate", "col_type": "float", "nullable": true},
    {"name": "linked_income_id", "col_type": "uuid", "nullable": true},
    {"name": "linked_liability_id", "col_type": "uuid", "nullable": true},
    {"name": "notes", "col_type": "text", "nullable": true},
    {"name": "is_portal_visible", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 8. client_liabilities
create_table "client_liabilities" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "liability_type", "col_type": "text", "nullable": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "original_amount", "col_type": "float", "nullable": true},
    {"name": "current_balance", "col_type": "float", "nullable": true},
    {"name": "interest_rate", "col_type": "float", "nullable": true},
    {"name": "monthly_payment", "col_type": "float", "nullable": true},
    {"name": "term_months", "col_type": "integer", "nullable": true},
    {"name": "start_date", "col_type": "text", "nullable": true},
    {"name": "end_date", "col_type": "text", "nullable": true},
    {"name": "linked_asset_id", "col_type": "uuid", "nullable": true},
    {"name": "creditor_name", "col_type": "text", "nullable": true},
    {"name": "is_portal_visible", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 9. client_income
create_table "client_income" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "income_type", "col_type": "text", "nullable": true},
    {"name": "source_name", "col_type": "text", "nullable": false},
    {"name": "gross_amount", "col_type": "float", "nullable": true},
    {"name": "net_amount", "col_type": "float", "nullable": true},
    {"name": "frequency", "col_type": "text", "nullable": true, "default_value": "Monthly"},
    {"name": "is_taxable", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "linked_asset_id", "col_type": "uuid", "nullable": true},
    {"name": "start_date", "col_type": "text", "nullable": true},
    {"name": "end_date", "col_type": "text", "nullable": true},
    {"name": "is_portal_visible", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 10. client_expenses
create_table "client_expenses" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "expense_category", "col_type": "text", "nullable": true},
    {"name": "expense_type", "col_type": "text", "nullable": true, "default_value": "Fixed"},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "amount", "col_type": "float", "nullable": true, "default_value": 0},
    {"name": "frequency", "col_type": "text", "nullable": true, "default_value": "Monthly"},
    {"name": "linked_liability_id", "col_type": "uuid", "nullable": true},
    {"name": "is_essential", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_portal_visible", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 11. client_goals
create_table "client_goals" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "workflow_id", "col_type": "uuid", "nullable": true},
    {"name": "goal_name", "col_type": "text", "nullable": true},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "goal_category", "col_type": "text", "nullable": true},
    {"name": "priority", "col_type": "text", "nullable": true, "default_value": "Important"},
    {"name": "target_amount", "col_type": "float", "nullable": true},
    {"name": "current_funding", "col_type": "float", "nullable": true},
    {"name": "target_date", "col_type": "text", "nullable": true},
    {"name": "funding_status", "col_type": "text", "nullable": true, "default_value": "On Track"},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

echo ""
echo "=== Portfolio & Investment Tables ==="

# 12. portfolios
create_table "portfolios" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "portfolio_type", "col_type": "text", "nullable": true, "default_value": "Investment"},
    {"name": "target_risk_score", "col_type": "integer", "nullable": true},
    {"name": "current_risk_score", "col_type": "integer", "nullable": true},
    {"name": "total_value", "col_type": "float", "nullable": true, "default_value": 0},
    {"name": "last_valuation_date", "col_type": "text", "nullable": true},
    {"name": "benchmark", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "created_by", "col_type": "uuid", "nullable": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 13. portfolio_holdings
create_table "portfolio_holdings" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "portfolio_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "product_id", "col_type": "uuid", "nullable": true},
    {"name": "fund_name", "col_type": "text", "nullable": false},
    {"name": "units", "col_type": "float", "nullable": true},
    {"name": "unit_price", "col_type": "float", "nullable": true},
    {"name": "current_value", "col_type": "float", "nullable": true},
    {"name": "percentage_allocation", "col_type": "float", "nullable": true},
    {"name": "performance_12m", "col_type": "float", "nullable": true},
    {"name": "fee_percentage", "col_type": "float", "nullable": true}
  ]
}'

# 14. products
create_table "products" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "provider_id", "col_type": "uuid", "nullable": true},
    {"name": "category_id", "col_type": "uuid", "nullable": true},
    {"name": "product_code", "col_type": "text", "nullable": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "premium_type", "col_type": "text", "nullable": true, "default_value": "Recurring"},
    {"name": "frequency_options", "col_type": "json", "nullable": true},
    {"name": "min_premium", "col_type": "float", "nullable": true},
    {"name": "max_premium", "col_type": "float", "nullable": true},
    {"name": "allows_switch", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "requires_reg28", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "created_by", "col_type": "uuid", "nullable": true},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 15. product_providers
create_table "product_providers" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "code", "col_type": "text", "nullable": false},
    {"name": "provider_type", "col_type": "text", "nullable": true, "default_value": "Insurance"},
    {"name": "swift_code", "col_type": "text", "nullable": true},
    {"name": "astute_code", "col_type": "text", "nullable": true},
    {"name": "portal_url", "col_type": "text", "nullable": true},
    {"name": "country", "col_type": "text", "nullable": true},
    {"name": "contact_email", "col_type": "text", "nullable": true},
    {"name": "contact_phone", "col_type": "text", "nullable": true},
    {"name": "services", "col_type": "json", "nullable": true},
    {"name": "postal_address", "col_type": "json", "nullable": true},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "is_approved", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_hidden", "col_type": "boolean", "nullable": true, "default_value": false}
  ]
}'

# 16. product_categories
create_table "product_categories" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "parent_id", "col_type": "uuid", "nullable": true},
    {"name": "sort_order", "col_type": "integer", "nullable": true, "default_value": 0}
  ]
}'

echo ""
echo "=== Task & Workflow Tables ==="

# 17. advisor_tasks (expand existing 9 cols → full schema)
create_table "advisor_tasks" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "title", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "task_type", "col_type": "text", "nullable": true},
    {"name": "priority", "col_type": "text", "nullable": true, "default_value": "Medium"},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Not Started"},
    {"name": "due_date", "col_type": "text", "nullable": true},
    {"name": "completed_at", "col_type": "timestamp", "nullable": true},
    {"name": "first_response_at", "col_type": "timestamp", "nullable": true},
    {"name": "follow_up_date", "col_type": "text", "nullable": true},
    {"name": "last_activity_at", "col_type": "timestamp", "nullable": true},
    {"name": "assigned_to_user_id", "col_type": "uuid", "nullable": true},
    {"name": "created_by", "col_type": "uuid", "nullable": true},
    {"name": "category", "col_type": "text", "nullable": true},
    {"name": "subcategory", "col_type": "text", "nullable": true},
    {"name": "source", "col_type": "text", "nullable": true},
    {"name": "source_reference", "col_type": "text", "nullable": true},
    {"name": "resolution", "col_type": "text", "nullable": true},
    {"name": "resolution_category", "col_type": "text", "nullable": true},
    {"name": "task_number", "col_type": "integer", "nullable": true},
    {"name": "sla_deadline", "col_type": "text", "nullable": true},
    {"name": "estimated_hours", "col_type": "float", "nullable": true},
    {"name": "actual_hours", "col_type": "float", "nullable": true},
    {"name": "notes", "col_type": "json", "nullable": true},
    {"name": "internal_notes", "col_type": "json", "nullable": true},
    {"name": "tags", "col_type": "json", "nullable": true},
    {"name": "watchers", "col_type": "json", "nullable": true},
    {"name": "is_practice_task", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_pinned", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_deleted", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "deleted_at", "col_type": "timestamp", "nullable": true}
  ]
}'

# 18. task_clients (junction)
create_table "task_clients" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "role", "col_type": "text", "nullable": true, "default_value": "primary"}
  ]
}'

# 19. task_documents
create_table "task_documents" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "document_name", "col_type": "text", "nullable": false},
    {"name": "document_url", "col_type": "text", "nullable": true},
    {"name": "document_type", "col_type": "text", "nullable": true},
    {"name": "file_size", "col_type": "integer", "nullable": true}
  ]
}'

# 20. task_communications
create_table "task_communications" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "communication_id", "col_type": "uuid", "nullable": true},
    {"name": "channel", "col_type": "text", "nullable": true},
    {"name": "direction", "col_type": "text", "nullable": true},
    {"name": "summary", "col_type": "text", "nullable": true}
  ]
}'

# 21. task_history
create_table "task_history" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "action", "col_type": "text", "nullable": false},
    {"name": "field_name", "col_type": "text", "nullable": true},
    {"name": "old_value", "col_type": "text", "nullable": true},
    {"name": "new_value", "col_type": "text", "nullable": true},
    {"name": "performed_by", "col_type": "uuid", "nullable": true},
    {"name": "comment", "col_type": "text", "nullable": true}
  ]
}'

# 22. saved_task_filters
create_table "saved_task_filters" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "filter_config", "col_type": "json", "nullable": false},
    {"name": "is_default", "col_type": "boolean", "nullable": true, "default_value": false}
  ]
}'

# 23. task_type_standards
create_table "task_type_standards" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_type", "col_type": "text", "nullable": false},
    {"name": "default_priority", "col_type": "text", "nullable": true, "default_value": "Medium"},
    {"name": "sla_hours", "col_type": "integer", "nullable": true},
    {"name": "execution_minutes", "col_type": "integer", "nullable": true},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

# 24-26. workflow tables
create_table "workflow_templates" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "steps", "col_type": "json", "nullable": true},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

create_table "workflows" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "template_id", "col_type": "uuid", "nullable": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "current_step", "col_type": "integer", "nullable": true, "default_value": 0},
    {"name": "step_data", "col_type": "json", "nullable": true}
  ]
}'

create_table "advice_workflows" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "workflow_type", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "data", "col_type": "json", "nullable": true}
  ]
}'

# 27. fais_controls
create_table "fais_controls" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "control_type", "col_type": "text", "nullable": false},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Pending"},
    {"name": "completed_date", "col_type": "text", "nullable": true},
    {"name": "expiry_date", "col_type": "text", "nullable": true},
    {"name": "notes", "col_type": "text", "nullable": true},
    {"name": "verified_by", "col_type": "uuid", "nullable": true}
  ]
}'

echo ""
echo "=== Financial Planning Tables ==="

create_table "fp_workflows" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "current_step", "col_type": "integer", "nullable": true, "default_value": 1},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "step_data", "col_type": "json", "nullable": true},
    {"name": "completed_steps", "col_type": "json", "nullable": true}
  ]
}'

create_table "fp_workflow_documents" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "workflow_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "document_name", "col_type": "text", "nullable": false},
    {"name": "document_url", "col_type": "text", "nullable": true},
    {"name": "step_number", "col_type": "integer", "nullable": true}
  ]
}'

create_table "goal_product_links" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "goal_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "product_id", "col_type": "uuid", "nullable": false},
    {"name": "allocation_percentage", "col_type": "float", "nullable": true}
  ]
}'

create_table "bucket_allocations" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "workflow_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "bucket_type", "col_type": "text", "nullable": false},
    {"name": "target_percentage", "col_type": "float", "nullable": true},
    {"name": "current_percentage", "col_type": "float", "nullable": true},
    {"name": "amount", "col_type": "float", "nullable": true}
  ]
}'

create_table "product_implementations" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "workflow_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "product_id", "col_type": "uuid", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Pending"},
    {"name": "implementation_date", "col_type": "text", "nullable": true},
    {"name": "notes", "col_type": "text", "nullable": true}
  ]
}'

create_table "sla_commitments" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "workflow_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "commitment_type", "col_type": "text", "nullable": false},
    {"name": "frequency", "col_type": "text", "nullable": true},
    {"name": "next_due_date", "col_type": "text", "nullable": true},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

echo ""
echo "=== Communication Tables ==="

create_table "emails" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "subject", "col_type": "text", "nullable": true},
    {"name": "body", "col_type": "text", "nullable": true},
    {"name": "from_address", "col_type": "text", "nullable": true},
    {"name": "to_addresses", "col_type": "json", "nullable": true},
    {"name": "cc_addresses", "col_type": "json", "nullable": true},
    {"name": "folder", "col_type": "text", "nullable": true, "default_value": "Inbox"},
    {"name": "is_read", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_starred", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "sent_at", "col_type": "timestamp", "nullable": true},
    {"name": "received_at", "col_type": "timestamp", "nullable": true}
  ]
}'

create_table "email_clients" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "email_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true}
  ]
}'

create_table "email_tasks" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "email_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "task_id", "col_type": "uuid", "nullable": false, "indexed": true}
  ]
}'

create_table "email_attachments" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "email_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "file_name", "col_type": "text", "nullable": false},
    {"name": "file_url", "col_type": "text", "nullable": true},
    {"name": "file_size", "col_type": "integer", "nullable": true},
    {"name": "content_type", "col_type": "text", "nullable": true}
  ]
}'

create_table "email_settings" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true, "unique": true},
    {"name": "email_signature", "col_type": "text", "nullable": true},
    {"name": "default_from", "col_type": "text", "nullable": true},
    {"name": "auto_bcc", "col_type": "text", "nullable": true}
  ]
}'

create_table "direct_messages" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "channel", "col_type": "text", "nullable": true, "default_value": "WhatsApp"},
    {"name": "direction", "col_type": "text", "nullable": true},
    {"name": "content", "col_type": "text", "nullable": true},
    {"name": "phone_number", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "sent"},
    {"name": "media_url", "col_type": "text", "nullable": true}
  ]
}'

create_table "communications" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "channel", "col_type": "text", "nullable": true},
    {"name": "direction", "col_type": "text", "nullable": true},
    {"name": "subject", "col_type": "text", "nullable": true},
    {"name": "content", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true}
  ]
}'

create_table "communication_campaigns" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "campaign_type", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Draft"},
    {"name": "subject", "col_type": "text", "nullable": true},
    {"name": "body", "col_type": "text", "nullable": true},
    {"name": "recipients", "col_type": "json", "nullable": true},
    {"name": "scheduled_at", "col_type": "timestamp", "nullable": true},
    {"name": "sent_at", "col_type": "timestamp", "nullable": true}
  ]
}'

create_table "campaign_attachments" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "campaign_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "file_name", "col_type": "text", "nullable": false},
    {"name": "file_url", "col_type": "text", "nullable": true},
    {"name": "file_size", "col_type": "integer", "nullable": true}
  ]
}'

echo ""
echo "=== Calendar & Meeting Tables ==="

create_table "calendar_events" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "title", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "event_type", "col_type": "text", "nullable": true, "default_value": "Meeting"},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Scheduled"},
    {"name": "start_time", "col_type": "timestamp", "nullable": false},
    {"name": "end_time", "col_type": "timestamp", "nullable": true},
    {"name": "location", "col_type": "text", "nullable": true},
    {"name": "attendees", "col_type": "json", "nullable": true},
    {"name": "is_all_day", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "recurrence_rule", "col_type": "text", "nullable": true},
    {"name": "meeting_prep_notes", "col_type": "text", "nullable": true}
  ]
}'

create_table "meeting_recordings" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "event_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true},
    {"name": "title", "col_type": "text", "nullable": true},
    {"name": "recording_url", "col_type": "text", "nullable": true},
    {"name": "transcript", "col_type": "text", "nullable": true},
    {"name": "summary", "col_type": "text", "nullable": true},
    {"name": "duration_seconds", "col_type": "integer", "nullable": true},
    {"name": "transcription_status", "col_type": "text", "nullable": true, "default_value": "pending"}
  ]
}'

echo ""
echo "=== Compliance & Finance Tables ==="

create_table "commissions" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "product_id", "col_type": "uuid", "nullable": true},
    {"name": "provider_id", "col_type": "uuid", "nullable": true},
    {"name": "commission_type", "col_type": "text", "nullable": true},
    {"name": "amount", "col_type": "float", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Pending"},
    {"name": "period_start", "col_type": "text", "nullable": true},
    {"name": "period_end", "col_type": "text", "nullable": true},
    {"name": "payment_date", "col_type": "text", "nullable": true}
  ]
}'

create_table "cpd_cycles" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "cycle_name", "col_type": "text", "nullable": false},
    {"name": "start_date", "col_type": "text", "nullable": false},
    {"name": "end_date", "col_type": "text", "nullable": false},
    {"name": "required_hours", "col_type": "float", "nullable": true},
    {"name": "completed_hours", "col_type": "float", "nullable": true, "default_value": 0},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"}
  ]
}'

create_table "cpd_records" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "cycle_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "activity_name", "col_type": "text", "nullable": false},
    {"name": "category", "col_type": "text", "nullable": true},
    {"name": "hours", "col_type": "float", "nullable": true},
    {"name": "completion_date", "col_type": "text", "nullable": true},
    {"name": "certificate_url", "col_type": "text", "nullable": true},
    {"name": "provider", "col_type": "text", "nullable": true}
  ]
}'

echo ""
echo "=== Opportunity & TLH Tables ==="

create_table "opportunity_projects" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Active"},
    {"name": "target_date", "col_type": "text", "nullable": true},
    {"name": "total_value", "col_type": "float", "nullable": true}
  ]
}'

create_table "project_opportunities" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "project_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": true, "indexed": true},
    {"name": "opportunity_type", "col_type": "text", "nullable": true},
    {"name": "value", "col_type": "float", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Open"},
    {"name": "notes", "col_type": "text", "nullable": true}
  ]
}'

create_table "project_tasks" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "project_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "title", "col_type": "text", "nullable": false},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Pending"},
    {"name": "assigned_to", "col_type": "uuid", "nullable": true},
    {"name": "due_date", "col_type": "text", "nullable": true}
  ]
}'

create_table "tlh_opportunities" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "portfolio_id", "col_type": "uuid", "nullable": true},
    {"name": "holding_name", "col_type": "text", "nullable": true},
    {"name": "unrealized_loss", "col_type": "float", "nullable": true},
    {"name": "tax_saving_estimate", "col_type": "float", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Identified"},
    {"name": "identified_date", "col_type": "text", "nullable": true}
  ]
}'

create_table "tlh_trades" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "opportunity_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "trade_type", "col_type": "text", "nullable": true},
    {"name": "from_holding", "col_type": "text", "nullable": true},
    {"name": "to_holding", "col_type": "text", "nullable": true},
    {"name": "amount", "col_type": "float", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true, "default_value": "Proposed"},
    {"name": "executed_at", "col_type": "timestamp", "nullable": true}
  ]
}'

create_table "tlh_fund_replacements" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "original_fund", "col_type": "text", "nullable": false},
    {"name": "replacement_fund", "col_type": "text", "nullable": false},
    {"name": "correlation", "col_type": "float", "nullable": true},
    {"name": "notes", "col_type": "text", "nullable": true}
  ]
}'

echo ""
echo "=== Settings & UI Tables ==="

# user_settings (expand existing 4 cols → full schema)
create_table "user_settings" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "unique": true},
    {"name": "display_name", "col_type": "text", "nullable": true},
    {"name": "email_signature", "col_type": "text", "nullable": true},
    {"name": "default_from_primary_adviser", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "timezone", "col_type": "text", "nullable": true, "default_value": "Africa/Johannesburg"},
    {"name": "date_format", "col_type": "text", "nullable": true},
    {"name": "time_format", "col_type": "text", "nullable": true},
    {"name": "default_calendar_view", "col_type": "text", "nullable": true},
    {"name": "notification_email", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_task_reminders", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_calendar_reminders", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_client_updates", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_compliance_alerts", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_sound_enabled", "col_type": "boolean", "nullable": true, "default_value": true},
    {"name": "notification_push_enabled", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "notification_critical_only_sound", "col_type": "boolean", "nullable": true, "default_value": false}
  ]
}'

create_table "user_jurisdictions" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "jurisdiction_code", "col_type": "text", "nullable": false},
    {"name": "jurisdiction_name", "col_type": "text", "nullable": true},
    {"name": "is_primary", "col_type": "boolean", "nullable": true, "default_value": false}
  ]
}'

create_table "user_widget_layouts" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "page", "col_type": "text", "nullable": false},
    {"name": "layout", "col_type": "json", "nullable": false}
  ]
}'

create_table "team_members" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "name", "col_type": "text", "nullable": false},
    {"name": "email", "col_type": "text", "nullable": false},
    {"name": "role", "col_type": "text", "nullable": true},
    {"name": "team_name", "col_type": "text", "nullable": true},
    {"name": "advisor_initials", "col_type": "text", "nullable": true},
    {"name": "jurisdiction", "col_type": "text", "nullable": true},
    {"name": "is_primary_adviser", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

# advisor_notifications (expand existing 6 cols)
create_table "advisor_notifications" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "type", "col_type": "text", "nullable": true, "default_value": "general"},
    {"name": "title", "col_type": "text", "nullable": false},
    {"name": "description", "col_type": "text", "nullable": true},
    {"name": "is_read", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "is_dismissed", "col_type": "boolean", "nullable": true, "default_value": false},
    {"name": "task_id", "col_type": "uuid", "nullable": true},
    {"name": "opportunity_tag", "col_type": "text", "nullable": true}
  ]
}'

create_table "advisor_posts" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "title", "col_type": "text", "nullable": false},
    {"name": "content", "col_type": "text", "nullable": true},
    {"name": "post_type", "col_type": "text", "nullable": true},
    {"name": "is_pinned", "col_type": "boolean", "nullable": true, "default_value": false}
  ]
}'

echo ""
echo "=== Vantage-Specific Tables ==="

create_table "whatsapp_favourites" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "client_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "phone_number", "col_type": "text", "nullable": true}
  ]
}'

create_table "admin_general_lists" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "list_type", "col_type": "text", "nullable": false},
    {"name": "value", "col_type": "text", "nullable": false},
    {"name": "label", "col_type": "text", "nullable": true},
    {"name": "sort_order", "col_type": "integer", "nullable": true, "default_value": 0},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

create_table "admin_funds" '{
  "storage_mode": "typed",
  "columns": [
    {"name": "user_id", "col_type": "uuid", "nullable": false, "indexed": true},
    {"name": "fund_name", "col_type": "text", "nullable": false},
    {"name": "fund_code", "col_type": "text", "nullable": true},
    {"name": "isin", "col_type": "text", "nullable": true},
    {"name": "asset_class", "col_type": "text", "nullable": true},
    {"name": "provider_id", "col_type": "uuid", "nullable": true},
    {"name": "is_active", "col_type": "boolean", "nullable": true, "default_value": true}
  ]
}'

echo ""
echo "================================"
echo "Success: $SUCCESS  |  Failed: $FAIL"
echo "================================"
