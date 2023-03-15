package app.product

import data.app.user as user_policy

default allow = false

# Product

# read
allow {
	input.action == "read"
	input.resourceType == "Product"
}

# create
allow {
	input.action == "create"
	input.resourceType == "Product"

	user_policy.is_admin
}

# Price

# read
allow {
	input.action == "read"
	input.resourceType == "Price"
}

# create
allow {
	input.action == "create"
	input.resourceType == "Price"

	user_policy.is_admin
}

# update
allow {
	input.action == "update"
	input.resourceType == "Price"

	user_policy.is_admin
}

# cancel
allow {
	input.action == "cancel"
	input.resourceType == "Price"

	user_policy.is_admin
}
