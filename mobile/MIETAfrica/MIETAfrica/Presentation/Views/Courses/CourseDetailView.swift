import SwiftUI

struct CourseDetailView: View {
    let course: CourseEntity

    var body: some View {
        List {
            Section("Overview") {
                Text(course.description)
            }
            Section("Details") {
                LabeledContent("Facilitator", value: course.facilitatorId)
                LabeledContent("Start Date", value: course.startDate.formatted(date: .abbreviated, time: .omitted))
                LabeledContent("End Date", value: course.endDate.formatted(date: .abbreviated, time: .omitted))
            }
        }
        .navigationTitle(course.title)
        .navigationBarTitleDisplayMode(.large)
    }
}
