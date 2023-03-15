package app.api.graphql

import data.app.user as user_policy

# Query

introspect["queries"] = queries {
	queries := {query.name: allowed |
		query := data.queries[_]
		allowed := can_query(query.name)
	}
}

# public
can_query(query_name) {
	public_queries[_] == query_name
}

# admin can access all queries
can_query(query_name) {
	user_policy.is_admin
}

# teacher
can_query(query_name) {
	user_policy.is_teacher
	teacher_queries[_] == query_name
}

# student
can_query(query_name) {
	user_policy.is_student
	student_queries[_] == query_name
}

# Mutation

introspect["mutations"] = mutations {
	mutations := {mutation.name: allowed |
		mutation := data.mutations[_]
		allowed := can_mutate(mutation.name)
	}
}

# public
can_mutate(mutation_name) {
	public_mutations[_] == mutation_name
}

# admin
can_mutate(mutation_name) {
	user_policy.is_admin
	admin_mutations[_] == mutation_name
}

# teacher
can_mutate(mutation_name) {
	user_policy.is_teacher
	teacher_mutations[_] == mutation_name
}

# student
can_mutate(mutation_name) {
	user_policy.is_student
	student_mutations[_] == mutation_name
}
