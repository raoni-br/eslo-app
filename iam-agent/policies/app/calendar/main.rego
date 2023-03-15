package app.calendar

import data.app.user as user_policy

default allow = false

# Event

# helpers
can_access_event {
	user_policy.is_admin
}

can_access_event {
	is_event_attendee
}

can_create_event {
	user_policy.is_teacher
}

is_event_attendee {
	input.resource.eventAttendees[_].attendeeId == input.user.id
}

is_owner {
	input.resource.ownerId == input.user.id
}

# read
allow {
	input.action == "read"
	input.resourceType == "Event"
	can_access_event
}

# list
allow {
	input.action == "list"
	input.resourceType == "Event"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.resourceType == "Event"
	input.action == "list"
	user_policy.is_admin
	admin_condition := {}
}

filter["attendee_condition"] = attendee_condition {
	input.resourceType == "Event"
	input.action == "list"
	attendee_condition := {"eventAttendees": {"some": {"attendeeId": input.user.id}}}
}

# insert
allow {
	input.action == "insert"
	input.resourceType == "Event"
	can_create_event
}

# bulk_insert
allow {
	input.action == "bulk_insert"
	input.resourceType == "Event"
	can_create_event
}

# update
allow {
	input.action == "update"
	input.resourceType = "Event"
	is_owner
}

# bulk_update
allow {
	input.action == "bulk_update"
	input.resourceType == "Event"
	filter[_]
}

filter["event_bulk_update_condition"] = event_bulk_update_condition {
	input.resourceType == "Event"
	input.action == "bulk_update"
	event_bulk_update_condition := {"ownerId": input.user.id}
}

# cancel
allow {
	input.action == "cancel"
	input.resourceType = "Event"
	is_owner
}

# delete
allow {
	input.action == "delete"
	input.resourceType = "Event"
	is_owner
}

# EventOccurrence

# list
allow {
	input.action == "list"
	input.resourceType == "EventOccurrence"
	filter[_]
}

filter["admin_condition"] = admin_condition {
	input.resourceType == "EventOccurrence"
	user_policy.is_admin
	admin_condition := {}
}

filter["event_occurrence_attendee_condition"] = event_occurrence_attendee_condition {
	input.resourceType == "EventOccurrence"
	event_occurrence_attendee_condition := {"eventOccurrenceAttendees": {"some": {"attendeeId": input.user.id}}}
}

# cancel
allow {
	input.action == "cancel"
	input.resourceType = "EventOccurrence"
	is_owner
}

# delete
allow {
	input.action == "delete"
	input.resourceType = "EventOccurrence"
	is_owner
}
