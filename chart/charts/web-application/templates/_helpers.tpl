

{{/*
*/}}
{{- define "web-application.internal.bindingName" -}}
{{- printf "%s-%s" (include "web-application.fullname" .root ) .name }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "web-application.internal.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Define Host for the APIRule
*/}}
{{- define "web-application.internal.exposeHost" -}}
{{- if .Values.expose.host }}
{{- tpl .Values.expose.host . }}
{{- else }}
{{- $name := (include "web-application.fullname" .) }}
{{- if hasPrefix $name .Release.Namespace }}
{{- .Release.Namespace }}
{{- else }}
{{- printf "%s-%s" $name .Release.Namespace | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Returns the TENANT_HOST_PATTERN if defined
*/}}
{{- define "web-application.internal.TENANT_HOST_PATTERN" -}}
{{- if .Values.env }}
  {{- if (kindIs "map" .Values.env) }}
    {{- if (hasKey .Values.env "TENANT_HOST_PATTERN")  }}
      {{-  .Values.env.TENANT_HOST_PATTERN }}
    {{- end }}
  {{- else }}
    {{- range $i, $item := .Values.env }}
      {{- if eq $item.name "TENANT_HOST_PATTERN"}}
        {{- $item.value }}
      {{- end }}
    {{- end }}
  {{- end }}
{{- end }}
{{- end }}

{{/*
Define the application uri to be used for the VCAP_APPLICATION env variable
*/}}
{{- define "web-application.internal.applicationUri" -}}
{{- include "web-application.fullname" . }}
{{- end }}

{{/*
Service Binding secret mounts
*/}}
{{- define "web-application.internal.serviceMounts" -}}
{{- $bindings := omit .Values.bindings "defaultProperties" -}}
{{- range $name, $params := $bindings }}
- mountPath: /bindings/{{ $name }}/
  name: "{{ $name }}"
  readOnly: true
{{- end }}
{{- end }}

{{/*
Service Binding secret volumes
*/}}
{{- define "web-application.internal.serviceVolumes" -}}
{{- $bindings := omit .Values.bindings "defaultProperties" -}}
{{- range $name, $params := $bindings }}
{{- $secretName := (include "web-application.internal.bindingName" (dict "root" $ "name" $name)) }}
{{- if $params.fromSecret }}
{{- $secretName = $params.fromSecret}}
{{- else if $params.secretName }}
{{- $secretName = $params.secretName }}
{{- end }}
- name: {{ $name }}
  secret:
    secretName: {{ tpl $secretName $ }}
{{- end }}
{{- end }}

{{/*
Name of the imagePullSecret
*/}}
{{- define "web-application.internal.imagePullSecretName" -}}
{{ $ips := (dict "local" .Values.imagePullSecret "global" .Values.global.imagePullSecret) }}
{{- if $ips.local.name }}
{{- $ips.local.name }}
{{- else if $ips.global.name }}
{{- $ips.global.name }}
{{- else if or $ips.local.dockerconfigjson $ips.global.dockerconfigjson }}
{{- include "web-application.fullname" . }}
{{- else }}
{{- "image-pull-secret" }}
{{- end }}
{{- end }}

{{/*
Calculate the final image name
*/}}
{{- define "web-application.internal.imageName" -}}
{{- $tag := .image.tag | default .context.Values.global.image.tag | default "latest" }}
{{- $registry := .image.registry | default .context.Values.global.image.registry }}
{{- if $registry }}
{{- $registry | trimSuffix "/" | trimPrefix "https://" }}/{{ .image.repository | trimSuffix "/" }}:{{ $tag }}
{{- else }}
{{- .image.repository | trimSuffix "/" | trimPrefix "https://" }}:{{ $tag }}
{{- end }}
{{- end }}

{{/*
Create the name of a service instance.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as service instance name.
*/}}
{{- define "web-application.internal.serviceInstanceName" -}}
  {{- $name := "" }}
  {{- if .binding.serviceInstanceFullname }}
    {{- if gt (len .binding.serviceInstanceFullname) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" .binding.serviceInstanceFullname) }}
    {{- end }}
    {{- $name = .binding.serviceInstanceFullname }}
  {{- else }}
    {{- $name = .binding.serviceInstanceName }}
    {{- if not (hasPrefix .root.Release.Name $name)}}
      {{- $name = printf "%s-%s" .root.Release.Name $name }}
    {{- end }}
    {{- if gt (len $name) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" $name) }}
    {{- end }}
  {{- end }}
  {{- tpl $name .root }}
{{- end }}

{{- define "web-application.internal.processEnv" -}}
{{- $result := dict }}
{{- $variables := list }}
{{- range $k, $v := .env }}
  {{- $variable := dict }}
  {{/*
    We support two versions to provide environment variables: as an array and as a map
    env:
    - name: TEST
      value: X
    env:
      TEST: X
    Transform the map case into the array case:
  */}}
  {{- if (not (kindIs "map" $v)) }}
    {{- $v = (dict "value" $v) }}
  {{- end }}
  {{- if (kindIs "string" $k) }} {{/* $k will be the array index (therefore int) in the array case */}}
    {{- $_ := (set $v "name" $k) }}
  {{- end }}

  {{/* we have defaults for APPLICATION_NAME and APPLICATION_URI, but only want to provide them, if the users has no explicit values. */}}
  {{- if eq "APPLICATION_NAME" $v.name }}
    {{- $_ := set $result "appName" true }}
  {{- end }}
  {{- if eq "APPLICATION_URI" $v.name }}
    {{- $_ := set $result "appURI" true }}
  {{- end }}

  {{/* Translate into K8s struct */}}
  {{- $_ := set $variable "name" $v.name }}
  {{- if $v.value }}
    {{- $_ := set $variable "value" ($v.value | toString) }}
  {{- else }}
    {{- $_ := set $variable "valueFrom" (omit $v "name")}}
  {{- end }}
  {{- $variables = append $variables $variable}}
{{- end }}
{{- $_ := set $result "vars" $variables }}
 {{- (fromYaml (tpl (toYaml $result) .context)) | mustToJson }}
{{- end }}

{{- define "web-application.internal.processEnvFrom" -}}
{{- $result := dict }}
{{- $variables := list }}
{{- range $envFrom := .envFrom }}
  {{- $variables = append $variables $envFrom }}
{{- end }}
{{- $_ := set $result "vars" $variables }}
{{- (fromYaml (tpl (toYaml $result) .context)) | mustToJson }}
{{- end }}
