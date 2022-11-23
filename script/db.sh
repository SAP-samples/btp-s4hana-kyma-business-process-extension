#!/bin/bash
set -e
cd "$(dirname "$(dirname "$0")")"

NAME="caphana"
SECRET_HEADER="$(cat <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: $NAME
type: Opaque
stringData:
  .metadata: |
     {
       "credentialProperties":
         [
           { "name": "certificate", "format": "text"},
           { "name": "database_id", "format": "text"},
           { "name": "driver", "format": "text"},
           { "name": "hdi_password", "format": "text"},
           { "name": "hdi_user", "format": "text"},
           { "name": "host", "format": "text"},
           { "name": "password", "format": "text"},
           { "name": "port", "format": "text"},
           { "name": "schema", "format": "text"},
           { "name": "url", "format": "text"},
           { "name": "user", "format": "text"}
         ],
       "metaDataProperties":
         [
           { "name": "plan", "format": "text" },
           { "name": "label", "format": "text" },
           { "name": "type", "format": "text" },
           { "name": "tags", "format": "json" }
         ]
     }
  type: hana
  label: hana
  plan: hdi-shared
  tags: '[ "hana", "database", "relational" ]'
EOF
)"
cf service $NAME || cf create-service hana hdi-shared $NAME
while true; do
    STATUS="$(cf service $NAME | grep status:)"
    echo $STATUS
    if [[ "$STATUS" = *succeeded* ]]; then
        break
    fi
    sleep 1
done
cf create-service-key $NAME $NAME-key
node "$(dirname "$0")/format-kyma-secret.js" -- "$(echo "$SECRET_HEADER")" "$(cf service-key $NAME $NAME-key)" | kubectl apply -f -
exit 0

