{{/*
Expand the name of the chart.
*/}}
{{- define "web-application.name" -}}
{{- tpl (default .Chart.Name .Values.nameOverride) . | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "web-application.fullname" -}}
  {{- if .Values.fullnameOverride }}
    {{- $name := tpl .Values.fullnameOverride . }}
    {{- if gt (len $name) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" $name) }}
    {{- end }}
    {{- $name }}
  {{- else }}
    {{- $name := tpl (default .Chart.Name .Values.nameOverride) . }}
    {{- if not (eq .Release.Name $name)}}
      {{- $name = printf "%s-%s" .Release.Name $name }}
    {{- end }}
    {{- if gt (len $name) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" $name) }}
    {{- end }}
    {{- $name }}
  {{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "web-application.labels" -}}
helm.sh/revision: {{ .Release.Revision | quote }}
helm.sh/chart: {{ include "web-application.internal.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{ include "web-application.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "web-application.selectorLabels" -}}
app.kubernetes.io/name: {{ include "web-application.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Values.global}}
{{- if .Values.global.component }}
app.kubernetes.io/component:{{ .Values.global.component }}
{{- end }}
{{- if .Values.global.partOf }}
app.kubernetes.io/part-of: {{ .Values.global.partOf }}
{{- end }}
{{- end }}
{{- end }}


