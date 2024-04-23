{{/*
Get list of deployment names
*/}}
{{- define "cap.deploymentNames" -}}
{{- $ := . -}}
{{- $defaultDeployments := (list "srv") -}}
  {{- if $.Values.sidecar -}}
{{-   $defaultDeployments = (append $defaultDeployments "sidecar") -}}
  {{- end -}}
  {{- if $.Values.approuter -}}
{{-   $defaultDeployments = (append $defaultDeployments "approuter") -}}
  {{- end -}}
{{ .deploymentNames | default $defaultDeployments | join ";" }}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.

copied from web-application: web-application.fullname

*/}}
{{- define "cap.deploymentHost" -}}
{{- if .deployment.expose.host }}
{{- .deployment.expose.host }}
{{- else }}
{{- $name := (include "cap.web-application.fullname" .) }}
{{- if hasPrefix $name .Release.Namespace }}
{{- .Release.Namespace }}
{{- else }}
{{- printf "%s-%s" $name .Release.Namespace | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "cap.web-application.fullname" -}}
{{- if .deployment.fullnameOverride }}
{{- .deployment.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .name .deployment.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Get FQDN of a deployment
*/}}
{{- define "cap.deploymentHostFull" -}}
{{- if not .deployment.expose.enabled }}
{{- printf "%s-%s.%s.svc.cluster.local:8080" .Release.Name .name .Release.Namespace }}
{{- else }}
{{- include "cap.deploymentHost" $ }}.{{ $.Values.global.domain }}
{{- end -}}
{{- end -}}

{{/*
Backend Destinations
*/}}
{{- define "cap.backendDestinations" -}}
{{- $ := . -}}
{{- $root := $.root -}}
{{- $nameKey := "name" -}}
{{- $urlKey := "url" -}}
{{- if $root.Values.backendDestinations }}
{{- $destinations := list -}}
{{- if $.html5 }}
{{- $nameKey = "Name" -}}
{{- $urlKey = "URL" -}}
{{- end -}}
{{- range $destinationName, $destination := $root.Values.backendDestinations -}}
    {{- $destination := merge (dict "name" $destinationName) $destination -}}
    {{- $deployment := (get $root.Values $destination.service) -}}
    {{- $srv := merge (dict "name" $destination.service "destination" $destination "deployment" $deployment) $root -}}
    {{- $destinationHost := include "cap.deploymentHostFull" $srv -}}
    {{- $protocol := "https" -}}
    {{- if not $deployment.expose.enabled }}
    {{- $protocol = "http" -}}
    {{- end -}}
    {{- $currentDestination := dict $nameKey $destination.name $urlKey (print  $protocol "://" $destinationHost ) -}}
    {{- $currentDestination := merge $currentDestination $.defaultParameters -}}
    {{- $destinations = (append $destinations $currentDestination) -}}
{{- end -}}
{{- $destinations | toJson }}
{{- end -}}
{{- end -}}