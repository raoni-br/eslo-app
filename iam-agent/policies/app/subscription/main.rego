package app.subscription

import data.app.user as user_policy

default allow = false

# ATTENTION: can_access and filter MUST be updated together

# Subscription

# helper
is_owner {
	input.resource.customerId = input.user.id
}

# read
allow {
	input.action == "read"
	input.resourceType == "Subscription"

	user_policy.is_admin
}

allow {
	input.action == "read"
	input.resourceType == "Subscription"

	is_owner
}

# list
allow {
	input.action == "list"
	input.resourceType == "Subscription"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.action == "list"
	input.resourceType == "Subscription"

	user_policy.is_admin
	admin_condition := {}
}

filter["user_condition"] = user_condition {
	input.action == "list"
	input.resourceType == "Subscription"

	not user_policy.is_admin

	user_condition := {"customerId": input.user.id}
}

# create
allow {
	input.action == "create"
	input.resourceType == "Subscription"
}

# activate
allow {
	input.action == "activate"
	input.resourceType == "Subscription"
	user_policy.is_admin
}

allow {
	input.action == "activate"
	input.resourceType == "Subscription"

	is_owner
}

# update
allow {
	input.action == "update"
	input.resourceType == "Subscription"
	
	is_owner
}
