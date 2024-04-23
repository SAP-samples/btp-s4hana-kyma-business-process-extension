{{/*
Labels for a component
*/}}
{{- define "cap.labels" -}}
helm.sh/revision: {{ .Release.Revision | quote }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}
{{- end -}}

{{/*
    Saas Registry Parameters
*/}}
{{- define "cap.service-instance.saasRegistryParameters" -}}
  {{- $srvHostFull := include "cap.deploymentHostFull" (merge (dict "name" "srv" "deployment" .Values.srv) . ) }}
  {{- if .Values.saasRegistryParameters.bindSidecar }}
    {{- $srvHostFull = include "cap.deploymentHostFull" (merge (dict "name" "sidecar" "deployment" .Values.sidecar) . ) }}
  {{- end}}
  {{- $parameters := .Values.saasRegistryParameters }}
  {{- $appUrls := $parameters.appUrls }}
  {{- $_ := set $appUrls "getDependencies" (printf "https://%s%s" $srvHostFull $appUrls.getDependencies) }}
  {{- $_ := set $appUrls "onSubscription" (printf "https://%s%s" $srvHostFull $appUrls.onSubscription) }}
  {{- $parameters | mustToJson }}
{{- end }}