package app.api.graphql

import data.app.user as user_policy

# Query

# all authenticated users have access to public queries
public_queries := {
	"products",
	"subscriptionByStripeCheckoutId",
}

teacher_queries := {
	"classroom",
	"enrollment",
	"findGroupById",
	"findGroupByTeacher",
	"invoicePreview",
	"lesson",
	"liveChatToken",
	"myCalendar",
	"myProfile",
	"product",
	"products",
	"program",
	"programs",
	"subscription",
	"teacherDashboard",
	"userSubscriptions",
	"getUserTutorialForm",
}

inactive_teacher_queries := {
	"classroom",
	"enrollment",
	"findGroupById",
	"findGroupByTeacher",
	"invoicePreview",
	"liveChatToken",
	# "myCalendar",
	"myProfile",
	"product",
	"products",
	"subscription",
}

student_queries := {
	"classroom",
	"enrollment",
	# "invoicePreview",
	"lesson",
	"liveChatToken",
	"myProfile",
	"product",
	"products",
	# "subscription",
	"studentDashboard",
}

inactive_student_queries := {
	"classroom",
	"enrollment",
	# "invoicePreview",
	"liveChatToken",
	"myProfile",
	"product",
	"products",
	# "subscription",
}

# Mutation

# all authenticated users have access to public mutations
public_mutations := {"createSubscriptionCheckout", "createSubscription", "submitUserTutorialForm"}

admin_mutations := {
	"activateEnrollment",
	"changeMyPassword",
	"createProduct",
	"createProductPrice",
	"updateMyProfile",
	"updateProductPrice",
}

teacher_mutations := {
	"cancelEnrollment",
	"changeEnrollmentSchedule",
	"changeMyPassword",
	"changeSpecificEvent",
	"createEnrollment",
	"createStudyGroup",
	"editFinishedClass",
	"finishClass",
	"removeStudentFromGroup",
	"removeStudyGroup",
	"revertFinishedClassStatus",
	"revertLessonStatus",
	"startClass",
	"updateMyProfile",
	"updateStudyGroup",
	"addStudentToGroup",
	"createPaymentMethodCheckoutMutation",
	"activateAndUpgradeSubscription"
}

inactive_teacher_mutations := {
	"changeMyPassword",
	"updateMyProfile",
	"activateAndUpgradeSubscription"
}

student_mutations := {
	"activateEnrollment",
	# "cancelEnrollment",
	"changeMyPassword",
	"updateMyProfile",
}

inactive_student_mutations := {
	"changeMyPassword",
	"updateMyProfile",
}
