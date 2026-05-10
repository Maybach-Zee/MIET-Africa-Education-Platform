import SwiftUI

struct LearnerDetailView: View {
    let learner: LearnerEntity

    var body: some View {
        List {
            Section {
                LabeledContent("First Name", value: learner.firstName)
                LabeledContent("Last Name", value: learner.lastName)
                LabeledContent("Email", value: learner.email)
            }
            Section("Enrollment") {
                Text(learner.enrolledCourseIds.isEmpty ? "No courses enrolled" : learner.enrolledCourseIds.joined(separator: ", "))
                    .foregroundStyle(learner.enrolledCourseIds.isEmpty ? .secondary : .primary)
            }
        }
        .navigationTitle("\(learner.firstName) \(learner.lastName)")
        .navigationBarTitleDisplayMode(.large)
    }
}
