# The "system" namespace is reserved for internal use
# by OPA. Authorization policy must be defined under
# system.authz as follows:
package system.authz

default allow = false # Reject requests by default.

allow {
	input.method == "POST"

	verified_identity
	allowed_path
}

verified_identity {
	input.identity == opa.runtime().env.IDENTITY_TOKEN
}

allowed_path {
	array.slice(input.path, 0, 3) == ["v1", "data", "app"]
}
