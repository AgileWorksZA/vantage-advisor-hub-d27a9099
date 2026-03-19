#!/usr/bin/env bash
set -euo pipefail

# Vantage Advisor Hub — Demo Data Seeder
# Seeds realistic South African financial advisory data via Kapable Data API
#
# Idempotency: Fetches existing records and checks by key fields before inserting.
# Safe to run multiple times.

BASE_URL="https://api.kapable.dev/v1"
API_KEY="${KAPABLE_DATA_KEY:?Set KAPABLE_DATA_KEY env var}"
USER_ID="00000000-0000-0000-0000-000000000001"

# Counters
CLIENTS_CREATED=0
TEAM_CREATED=0
NOTIFICATIONS_CREATED=0
SETTINGS_CREATED=0
TASK_TYPES_CREATED=0
TASKS_CREATED=0

post() {
  local table="$1"
  local body="$2"
  curl -sf -X POST "${BASE_URL}/${table}" \
    -H "x-api-key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$body" 2>/dev/null
}

fetch_all() {
  curl -sf "${BASE_URL}/${1}?limit=200" -H "x-api-key: ${API_KEY}"
}

total_of() {
  echo "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)['pagination']['total'])"
}

# Check if a field value exists in the cached JSON
has_val() {
  python3 -c "
import json, sys
data = json.loads(sys.argv[1])['data']
field, val = sys.argv[2], sys.argv[3]
sys.exit(0 if any(str(r.get(field,''))==val for r in data) else 1)
" "$1" "$2" "$3" 2>/dev/null
}

# Get ID by field value from cached JSON
get_id() {
  python3 -c "
import json, sys
data = json.loads(sys.argv[1])['data']
field, val = sys.argv[2], sys.argv[3]
for r in data:
    if str(r.get(field,''))==val:
        print(r['id']); sys.exit(0)
sys.exit(1)
" "$1" "$2" "$3" 2>/dev/null
}

echo "========================================="
echo "  Vantage Advisor Hub — Demo Data Seeder"
echo "========================================="
echo ""

# ─────────────────────────────────────────────
# 1. CLIENTS (~17 new, for ~20 total)
# ─────────────────────────────────────────────
# Accepted columns: profile_state, profile_type, client_type, first_name, surname,
#   email, nationality, gender, id_number, cell_number, date_of_birth,
#   advisor, rating, residential_address (JSON), postal_address (JSON)
# user_id is auto-set from the API key. Do NOT include it.
# ─────────────────────────────────────────────
echo "▸ Seeding clients..."

CLIENTS_CACHE=$(fetch_all "clients")
echo "  Existing clients: $(total_of "$CLIENTS_CACHE")"

declare -a CLIENT_IDS=()

seed_client() {
  local json="$1"
  local email
  email=$(python3 -c "import json,sys; print(json.loads(sys.argv[1]).get('email',''))" "$json")

  if has_val "$CLIENTS_CACHE" "email" "$email"; then
    local eid
    eid=$(get_id "$CLIENTS_CACHE" "email" "$email")
    CLIENT_IDS+=("$eid")
    echo "  = Exists: ${email}"
    return 0
  fi

  local result
  result=$(post "clients" "$json")
  if [ -z "$result" ]; then
    echo "  ! FAILED: ${email}" >&2
    CLIENT_IDS+=("null")
    return 1
  fi

  local new_id
  new_id=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['id'])" "$result")
  CLIENT_IDS+=("$new_id")

  # Update cache
  CLIENTS_CACHE=$(python3 -c "
import json, sys
d = json.loads(sys.argv[1])
d['data'].append({'email': sys.argv[2], 'id': sys.argv[3]})
d['pagination']['total'] += 1
print(json.dumps(d))
" "$CLIENTS_CACHE" "$email" "$new_id")

  CLIENTS_CREATED=$((CLIENTS_CREATED + 1))
  echo "  + Created: ${email} (${new_id})"
}

# Client 0 — Themba Mkhize, Individual, Active Client, full profile
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Themba", "surname": "Mkhize",
  "id_number": "7805155123081", "nationality": "ZA", "gender": "Male",
  "date_of_birth": "1978-05-15", "email": "themba.mkhize@standardbank.co.za",
  "cell_number": "+27823456789",
  "residential_address": {"line1":"42 Sandton Drive","line2":"Sandhurst","city":"Johannesburg","province":"Gauteng","postal_code":"2196","country":"ZA"},
  "advisor": "Johan van der Merwe", "rating": 5
}'

# Client 1 — Naledi Dlamini, Individual, Active Client
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Naledi", "surname": "Dlamini",
  "id_number": "8503210456087", "nationality": "ZA", "gender": "Female",
  "date_of_birth": "1985-03-21", "email": "naledi.dlamini@gmail.com",
  "cell_number": "+27844567890",
  "residential_address": {"line1":"15 Melrose Boulevard","line2":"Melrose Arch","city":"Johannesburg","province":"Gauteng","postal_code":"2196","country":"ZA"},
  "advisor": "Sarah Thompson", "rating": 4
}'

# Client 2 — Francois Venter, Individual, Active Client, sparse
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Francois", "surname": "Venter", "email": "fventer@mweb.co.za",
  "nationality": "ZA", "advisor": "Pieter Botha", "rating": 3
}'

# Client 3 — Aisha Patel, Individual, Prospect
seed_client '{
  "profile_state": "Active", "profile_type": "Prospect", "client_type": "individual",
  "first_name": "Aisha", "surname": "Patel",
  "nationality": "ZA", "gender": "Female", "date_of_birth": "1990-11-08",
  "email": "aisha.patel@uct.ac.za", "cell_number": "+27765432109",
  "residential_address": {"line1":"8 Dean Street","city":"Newlands","province":"Western Cape","postal_code":"7700","country":"ZA"},
  "advisor": "Sarah Thompson", "rating": 4
}'

# Client 4 — Protea Holdings, Business, Active Client
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "business",
  "first_name": "Protea", "surname": "Holdings (Pty) Ltd",
  "email": "finance@proteaholdings.co.za", "cell_number": "+27219876543",
  "nationality": "ZA",
  "residential_address": {"line1":"100 Strand Street","city":"Cape Town","province":"Western Cape","postal_code":"8001","country":"ZA"},
  "advisor": "Johan van der Merwe", "rating": 5
}'

# Client 5 — Van der Merwe Family Trust, Trust, Active Client
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "trust",
  "first_name": "Van der Merwe", "surname": "Family Trust",
  "email": "trust@vdmfamily.co.za", "nationality": "ZA",
  "advisor": "Johan van der Merwe", "rating": 4
}'

# Client 6 — Sipho Nkomo, Individual, Active Client, full profile
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Sipho", "surname": "Nkomo",
  "id_number": "6712105678083", "nationality": "ZA", "gender": "Male",
  "date_of_birth": "1967-12-10", "email": "sipho.nkomo@telkom.co.za",
  "cell_number": "+27832345678",
  "residential_address": {"line1":"22 Lynnwood Road","city":"Pretoria","province":"Gauteng","postal_code":"0081","country":"ZA"},
  "advisor": "Pieter Botha", "rating": 3
}'

# Client 7 — Michael O'Brien, Individual, Lead
seed_client '{
  "profile_state": "Active", "profile_type": "Lead", "client_type": "individual",
  "first_name": "Michael", "surname": "O'\''Brien",
  "email": "mobrien@icloud.com", "nationality": "IE",
  "advisor": "Sarah Thompson", "rating": 2
}'

# Client 8 — Liezel Steyn, Individual, Active Client, full profile
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Liezel", "surname": "Steyn",
  "id_number": "7209180234086", "nationality": "ZA", "gender": "Female",
  "date_of_birth": "1972-09-18", "email": "liezel.steyn@woolworths.co.za",
  "cell_number": "+27845678901",
  "residential_address": {"line1":"5 Constantia Main Road","city":"Constantia","province":"Western Cape","postal_code":"7806","country":"ZA"},
  "advisor": "Johan van der Merwe", "rating": 5
}'

# Client 9 — Kagiso Motlanthe, Individual, Prospect
seed_client '{
  "profile_state": "Active", "profile_type": "Prospect", "client_type": "individual",
  "first_name": "Kagiso", "surname": "Motlanthe",
  "nationality": "ZA", "gender": "Male", "date_of_birth": "1995-02-14",
  "email": "kagiso.m@outlook.com", "cell_number": "+27876543210",
  "advisor": "Pieter Botha", "rating": 3
}'

# Client 10 — Kgalagadi Mining Corp, Business, Active Client
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "business",
  "first_name": "Kgalagadi", "surname": "Mining Corp",
  "email": "cfo@kgalagadimining.co.za", "cell_number": "+27534567890",
  "nationality": "ZA",
  "residential_address": {"line1":"Kgalagadi Business Park","city":"Kimberley","province":"Northern Cape","postal_code":"8300","country":"ZA"},
  "advisor": "Johan van der Merwe", "rating": 4
}'

# Client 11 — Zanele Ngcobo, Individual, Active Client, sparse
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Zanele", "surname": "Ngcobo",
  "email": "zanele.n@discovery.co.za", "nationality": "ZA", "gender": "Female",
  "advisor": "Sarah Thompson", "rating": 4
}'

# Client 12 — Ruan de Villiers, Individual, Lead
seed_client '{
  "profile_state": "Active", "profile_type": "Lead", "client_type": "individual",
  "first_name": "Ruan", "surname": "de Villiers",
  "email": "ruan.devilliers@absa.co.za", "nationality": "ZA", "gender": "Male",
  "cell_number": "+27823456701",
  "advisor": "Johan van der Merwe", "rating": 2
}'

# Client 13 — Priya Naidoo, Individual, Active Client, full profile
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "individual",
  "first_name": "Priya", "surname": "Naidoo",
  "id_number": "8807250345089", "nationality": "ZA", "gender": "Female",
  "date_of_birth": "1988-07-25", "email": "priya.naidoo@deloitte.com",
  "cell_number": "+27611234567",
  "residential_address": {"line1":"301 Umhlanga Ridge","line2":"Umhlanga Rocks","city":"Durban","province":"KwaZulu-Natal","postal_code":"4320","country":"ZA"},
  "advisor": "Sarah Thompson", "rating": 4
}'

# Client 14 — Werner Kruger, Individual, Prospect
seed_client '{
  "profile_state": "Active", "profile_type": "Prospect", "client_type": "individual",
  "first_name": "Werner", "surname": "Kruger", "nationality": "ZA",
  "gender": "Male", "date_of_birth": "1960-04-03",
  "email": "werner.kruger@gmail.com", "cell_number": "+27829876543",
  "advisor": "Pieter Botha", "rating": 3
}'

# Client 15 — Naidoo Education Trust, Trust, Active Client
seed_client '{
  "profile_state": "Active", "profile_type": "Client", "client_type": "trust",
  "first_name": "Naidoo Education", "surname": "Trust",
  "email": "trustees@naidooeducation.co.za", "nationality": "ZA",
  "advisor": "Sarah Thompson", "rating": 3
}'

# Client 16 — Johannes Pretorius, Individual, Inactive Client
seed_client '{
  "profile_state": "Inactive", "profile_type": "Client", "client_type": "individual",
  "first_name": "Johannes", "surname": "Pretorius",
  "email": "jpretorius@vodacom.co.za", "nationality": "ZA", "gender": "Male",
  "date_of_birth": "1955-08-22", "advisor": "Johan van der Merwe", "rating": 2
}'

echo "  Created this run: ${CLIENTS_CREATED}"
echo "  Client IDs collected: ${#CLIENT_IDS[@]}"
echo ""

# ─────────────────────────────────────────────
# 2. TEAM MEMBERS (5)
# ─────────────────────────────────────────────
echo "▸ Seeding team members..."

TEAM_CACHE=$(fetch_all "team_members")
echo "  Existing: $(total_of "$TEAM_CACHE")"

seed_team() {
  local json="$1"
  local email
  email=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['email'])" "$json")
  if has_val "$TEAM_CACHE" "email" "$email"; then
    echo "  = Exists: ${email}"
    return 0
  fi
  local result
  result=$(post "team_members" "$json")
  if [ -z "$result" ]; then echo "  ! FAILED: ${email}" >&2; return 1; fi
  TEAM_CACHE=$(python3 -c "
import json, sys
d = json.loads(sys.argv[1])
d['data'].append({'email': sys.argv[2]})
d['pagination']['total'] += 1
print(json.dumps(d))
" "$TEAM_CACHE" "$email")
  TEAM_CREATED=$((TEAM_CREATED + 1))
  echo "  + Created: ${email}"
}

seed_team '{"user_id":"'"$USER_ID"'","name":"Johan van der Merwe","email":"johan@vantagewealth.co.za","role":"admin","team_name":"Advisory","advisor_initials":"JvdM","jurisdiction":"South Africa","is_primary_adviser":true,"is_active":true}'
seed_team '{"user_id":"'"$USER_ID"'","name":"Sarah Thompson","email":"sarah@vantagewealth.co.za","role":"member","team_name":"Advisory","advisor_initials":"ST","jurisdiction":"South Africa","is_primary_adviser":false,"is_active":true}'
seed_team '{"user_id":"'"$USER_ID"'","name":"Pieter Botha","email":"pieter@vantagewealth.co.za","role":"member","team_name":"Advisory","advisor_initials":"PB","jurisdiction":"South Africa","is_primary_adviser":false,"is_active":true}'
seed_team '{"user_id":"'"$USER_ID"'","name":"Thandi Nkosi","email":"thandi@vantagewealth.co.za","role":"member","team_name":"Compliance","advisor_initials":"TN","jurisdiction":"South Africa","is_primary_adviser":false,"is_active":true}'
seed_team '{"user_id":"'"$USER_ID"'","name":"Lisa Chen","email":"lisa@vantagewealth.co.za","role":"admin","team_name":"Operations","advisor_initials":"LC","jurisdiction":"South Africa","is_primary_adviser":false,"is_active":true}'

echo "  Created: ${TEAM_CREATED}"
echo ""

# ─────────────────────────────────────────────
# 3. ADVISOR NOTIFICATIONS (10)
# ─────────────────────────────────────────────
echo "▸ Seeding advisor notifications..."

NOTIF_CACHE=$(fetch_all "advisor_notifications")
EXISTING_NOTIF=$(total_of "$NOTIF_CACHE")
echo "  Existing: ${EXISTING_NOTIF}"

seed_notif() {
  local json="$1"
  local title
  title=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['title'])" "$json")
  if has_val "$NOTIF_CACHE" "title" "$title"; then
    echo "  = Exists: ${title}"
    return 0
  fi
  local result
  result=$(post "advisor_notifications" "$json")
  if [ -z "$result" ]; then echo "  ! FAILED: ${title}" >&2; return 1; fi
  NOTIF_CACHE=$(python3 -c "
import json, sys
d = json.loads(sys.argv[1])
d['data'].append({'title': sys.argv[2]})
d['pagination']['total'] += 1
print(json.dumps(d))
" "$NOTIF_CACHE" "$title")
  NOTIFICATIONS_CREATED=$((NOTIFICATIONS_CREATED + 1))
  echo "  + Created: ${title}"
}

seed_notif '{"user_id":"'"$USER_ID"'","type":"task","title":"Annual review due: Themba Mkhize","description":"Annual portfolio review is scheduled for next week. Prepare performance report and recommendation letter.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"communication","title":"New message from Naledi Dlamini","description":"Client responded to your retirement planning proposal. Wants to schedule a follow-up meeting.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"transaction","title":"Switch instruction processed","description":"Liezel Steyn RA fund switch from Allan Gray Balanced to Coronation Top 20 completed successfully.","is_read":true,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"general","title":"FSCA Regulatory Update","description":"New FAIS amendment effective 1 April 2026. Review updated compliance requirements for Conduct of Business.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"task","title":"Client complaint SLA expiring","description":"Francois Venter complaint #TC-2026-012 — response due within 24 hours per FAIS requirements.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"communication","title":"Missed call: Sipho Nkomo","description":"Client called at 14:32. Left message about updating beneficiary nominations on retirement annuity.","is_read":true,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"transaction","title":"Premium payment failed","description":"Priya Naidoo — Old Mutual life cover premium debit order returned unpaid. Follow up with client.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"general","title":"CPD hours reminder","description":"12 CPD hours remaining for current cycle ending 30 June 2026. Consider upcoming FPI webinar series.","is_read":true,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"task","title":"Onboarding documents pending","description":"Aisha Patel FICA documents — awaiting proof of address and bank statement. Sent reminder 3 days ago.","is_read":false,"is_dismissed":false}'
seed_notif '{"user_id":"'"$USER_ID"'","type":"communication","title":"Protea Holdings board resolution received","description":"Updated board resolution for authorized signatories received via email. Upload to client file.","is_read":true,"is_dismissed":false}'

echo "  Created: ${NOTIFICATIONS_CREATED}"
echo ""

# ─────────────────────────────────────────────
# 4. USER SETTINGS (delete old + recreate)
# ─────────────────────────────────────────────
echo "▸ Seeding user settings..."

SETTINGS_CACHE=$(fetch_all "user_settings")
EXISTING_SETTINGS=$(total_of "$SETTINGS_CACHE")

# Note: user_settings typed table only accepts: user_id, timezone,
# notification_sound_enabled, notification_push_enabled.
# Other columns exist in schema but are not yet exposed via the Data API typed table.
if [ "$EXISTING_SETTINGS" -gt 0 ]; then
  echo "  = Already exists (${EXISTING_SETTINGS} record)"
else
  result=$(post "user_settings" '{
    "user_id": "'"$USER_ID"'",
    "timezone": "Africa/Johannesburg",
    "notification_sound_enabled": true,
    "notification_push_enabled": false
  }')
  if [ -n "$result" ]; then
    SETTINGS_CREATED=1
    echo "  + Created user settings (timezone, notification prefs)"
  else
    echo "  ! Failed to create user settings"
  fi
fi

echo ""

# ─────────────────────────────────────────────
# 5. TASK TYPE STANDARDS (7)
# ─────────────────────────────────────────────
echo "▸ Seeding task type standards..."

TT_CACHE=$(fetch_all "task_type_standards")
echo "  Existing: $(total_of "$TT_CACHE")"

seed_tt() {
  local json="$1"
  local tt
  tt=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['task_type'])" "$json")
  if has_val "$TT_CACHE" "task_type" "$tt"; then
    echo "  = Exists: ${tt}"
    return 0
  fi
  local result
  result=$(post "task_type_standards" "$json")
  if [ -z "$result" ]; then echo "  ! FAILED: ${tt}" >&2; return 1; fi
  TT_CACHE=$(python3 -c "
import json, sys
d = json.loads(sys.argv[1])
d['data'].append({'task_type': sys.argv[2]})
d['pagination']['total'] += 1
print(json.dumps(d))
" "$TT_CACHE" "$tt")
  TASK_TYPES_CREATED=$((TASK_TYPES_CREATED + 1))
  echo "  + Created: ${tt}"
}

seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Client Complaint","default_priority":"High","sla_hours":48,"execution_minutes":120,"description":"Formal client complaint requiring investigation and resolution per FAIS requirements","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Follow-up","default_priority":"Medium","sla_hours":72,"execution_minutes":30,"description":"Follow-up action from a client meeting, call, or previous task","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Annual Review","default_priority":"Medium","sla_hours":168,"execution_minutes":180,"description":"Comprehensive annual portfolio and financial plan review","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Portfolio Review","default_priority":"Medium","sla_hours":120,"execution_minutes":90,"description":"Interim portfolio performance and allocation review","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Compliance","default_priority":"High","sla_hours":24,"execution_minutes":60,"description":"Regulatory compliance task — FICA, FAIS, or FSCA requirement","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Onboarding","default_priority":"Medium","sla_hours":240,"execution_minutes":240,"description":"New client onboarding — FICA, risk profiling, needs analysis, product setup","is_active":true}'
seed_tt '{"user_id":"'"$USER_ID"'","task_type":"Document Request","default_priority":"Low","sla_hours":96,"execution_minutes":15,"description":"Request for client documents — statements, certificates, or compliance records","is_active":true}'

echo "  Created: ${TASK_TYPES_CREATED}"
echo ""

# ─────────────────────────────────────────────
# 6. ADVISOR TASKS (15)
# ─────────────────────────────────────────────
echo "▸ Seeding advisor tasks..."

TASKS_CACHE=$(fetch_all "advisor_tasks")
echo "  Existing: $(total_of "$TASKS_CACHE")"

seed_task() {
  local json="$1"
  local title
  title=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['title'])" "$json")
  if has_val "$TASKS_CACHE" "title" "$title"; then
    echo "  = Exists: ${title}"
    return 0
  fi
  local result
  result=$(post "advisor_tasks" "$json")
  if [ -z "$result" ]; then echo "  ! FAILED: ${title}" >&2; return 1; fi
  TASKS_CACHE=$(python3 -c "
import json, sys
d = json.loads(sys.argv[1])
d['data'].append({'title': sys.argv[2]})
d['pagination']['total'] += 1
print(json.dumps(d))
" "$TASKS_CACHE" "$title")
  TASKS_CREATED=$((TASKS_CREATED + 1))
  echo "  + Created: ${title}"
}

# Use client IDs from the array
# Index: 0=Themba, 1=Naledi, 2=Francois, 3=Aisha, 4=Protea Holdings,
#        5=VdM Trust, 6=Sipho, 7=Michael, 8=Liezel, 9=Kagiso,
#       10=Kgalagadi, 11=Zanele, 12=Ruan, 13=Priya, 14=Werner, 15=Naidoo Trust, 16=Johannes

C0="${CLIENT_IDS[0]:-null}"
C1="${CLIENT_IDS[1]:-null}"
C2="${CLIENT_IDS[2]:-null}"
C3="${CLIENT_IDS[3]:-null}"
C4="${CLIENT_IDS[4]:-null}"
C5="${CLIENT_IDS[5]:-null}"
C6="${CLIENT_IDS[6]:-null}"
C8="${CLIENT_IDS[8]:-null}"
C9="${CLIENT_IDS[9]:-null}"
C10="${CLIENT_IDS[10]:-null}"
C11="${CLIENT_IDS[11]:-null}"
C13="${CLIENT_IDS[13]:-null}"
C14="${CLIENT_IDS[14]:-null}"
C15="${CLIENT_IDS[15]:-null}"

# Note: advisor_tasks typed table only accepts: user_id, client_id, title, description,
# task_type, priority, status, due_date, is_deleted.
# Other columns (category, source, estimated_hours, completed_at, etc.) are in _meta
# but not yet exposed via the typed table insert.

# Task 1 — Annual Review, In Progress
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C0"'","title":"Annual portfolio review — Themba Mkhize","description":"Comprehensive annual review of investment portfolio, retirement planning, and risk cover. Client has expressed interest in offshore diversification.","task_type":"Annual Review","priority":"High","status":"In Progress","due_date":"2026-03-25","is_deleted":false}'

# Task 2 — Follow-up, Not Started
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C1"'","title":"Follow up on retirement annuity proposal","description":"Naledi requested more info on living annuity vs guaranteed annuity options. Send comparison document.","task_type":"Follow-up","priority":"Medium","status":"Not Started","due_date":"2026-03-22","is_deleted":false}'

# Task 3 — Client Complaint, In Progress
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C2"'","title":"Investigate complaint: fee disclosure","description":"Francois Venter raised concern about undisclosed advice fees on latest statement. Pull all fee disclosure records and respond within 48h SLA.","task_type":"Client Complaint","priority":"High","status":"In Progress","due_date":"2026-03-20","is_deleted":false}'

# Task 4 — Onboarding, Pending Client
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C3"'","title":"Complete onboarding — Aisha Patel","description":"FICA documents outstanding: proof of address, bank statement. Risk profiling completed. Needs analysis meeting scheduled for 26 March.","task_type":"Onboarding","priority":"Medium","status":"Pending Client","due_date":"2026-03-28","is_deleted":false}'

# Task 5 — Portfolio Review, Not Started
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C4"'","title":"Q1 2026 portfolio review — Protea Holdings","description":"Quarterly investment review for Protea Holdings corporate portfolio. Prepare performance report and benchmark comparison.","task_type":"Portfolio Review","priority":"Medium","status":"Not Started","due_date":"2026-04-05","is_deleted":false}'

# Task 6 — Compliance, Completed
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C5"'","title":"Update trust deed — Van der Merwe Family Trust","description":"New trustee appointment. Updated trust deed received, FICA documentation updated. Filed with Master of the High Court.","task_type":"Compliance","priority":"High","status":"Completed","due_date":"2026-03-15","is_deleted":false}'

# Task 7 — Follow-up, Pending Client
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C6"'","title":"Beneficiary nomination update — Sipho Nkomo","description":"Client wants to update beneficiary nominations on retirement annuity and group life cover. Sent forms via email, awaiting signed copies.","task_type":"Follow-up","priority":"Medium","status":"Pending Client","due_date":"2026-03-26","is_deleted":false}'

# Task 8 — Document Request, Not Started
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C8"'","title":"Request updated tax certificate — Liezel Steyn","description":"Client needs IT3(b) certificate for 2025 tax year from Allan Gray for RA contribution deduction.","task_type":"Document Request","priority":"Low","status":"Not Started","due_date":"2026-04-15","is_deleted":false}'

# Task 9 — Annual Review, Completed
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C11"'","title":"Annual review — Zanele Ngcobo","description":"Completed annual review. Recommended increasing RA contribution by R1,500/month and adding income protector cover.","task_type":"Annual Review","priority":"Medium","status":"Completed","due_date":"2026-03-12","is_deleted":false}'

# Task 10 — Compliance, In Progress
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C10"'","title":"FICA refresh — Kgalagadi Mining Corp","description":"Corporate FICA documents expired. Request updated company registration, director ID copies, and proof of business address.","task_type":"Compliance","priority":"High","status":"In Progress","due_date":"2026-03-22","is_deleted":false}'

# Task 11 — Portfolio Review, Completed
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C13"'","title":"Tax-loss harvesting review — Priya Naidoo","description":"Identified R45,000 unrealized loss in Coronation Global Opportunities. Executed switch to Ninety One Global Franchise for 45-day wash sale period.","task_type":"Portfolio Review","priority":"Medium","status":"Completed","due_date":"2026-03-10","is_deleted":false}'

# Task 12 — Follow-up, Not Started
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C9"'","title":"Send investment proposal — Kagiso Motlanthe","description":"Prospect interested in TFSA and discretionary investment. Prepare proposal with 3 portfolio options (conservative, moderate, aggressive).","task_type":"Follow-up","priority":"Medium","status":"Not Started","due_date":"2026-03-24","is_deleted":false}'

# Task 13 — Onboarding, Not Started
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C14"'","title":"Retirement planning consultation — Werner Kruger","description":"Prospect retiring in 6 months. Needs comprehensive retirement income strategy. Schedule initial consultation.","task_type":"Onboarding","priority":"High","status":"Not Started","due_date":"2026-03-27","is_deleted":false}'

# Task 14 — Document Request, Completed
seed_task '{"user_id":"'"$USER_ID"'","client_id":"'"$C15"'","title":"Annual trust financial statements","description":"Requested and filed annual financial statements for Naidoo Education Trust from auditors.","task_type":"Document Request","priority":"Low","status":"Completed","due_date":"2026-03-08","is_deleted":false}'

# Task 15 — Practice task (no client)
seed_task '{"user_id":"'"$USER_ID"'","title":"Prepare Q1 2026 practice performance report","description":"Compile AUM growth, new client acquisition, revenue, and compliance metrics for quarterly practice review meeting.","task_type":"Follow-up","priority":"Medium","status":"Not Started","due_date":"2026-04-01","is_deleted":false}'

echo "  Created: ${TASKS_CREATED}"
echo ""

# ─────────────────────────────────────────────
# FINAL COUNTS
# ─────────────────────────────────────────────
echo "========================================="
echo "  Seeding Complete — Final Counts"
echo "========================================="
echo ""

for table in clients team_members advisor_notifications user_settings task_type_standards advisor_tasks; do
  TOTAL=$(total_of "$(fetch_all "$table")")
  printf "  %-25s %s\n" "${table}:" "${TOTAL}"
done

echo ""
echo "  Created this run:"
echo "    Clients:        ${CLIENTS_CREATED}"
echo "    Team Members:   ${TEAM_CREATED}"
echo "    Notifications:  ${NOTIFICATIONS_CREATED}"
echo "    Settings:       ${SETTINGS_CREATED}"
echo "    Task Types:     ${TASK_TYPES_CREATED}"
echo "    Tasks:          ${TASKS_CREATED}"
echo ""
echo "Done!"
