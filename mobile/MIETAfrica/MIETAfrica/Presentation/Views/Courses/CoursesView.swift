import SwiftUI

struct CoursesView: View {
    @Environment(CoursesCoordinator.self) private var coordinator
    @State private var viewModel = CoursesViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.courses.isEmpty {
                ContentUnavailableView("No Courses", systemImage: "book.closed")
            } else {
                List(viewModel.courses) { course in
                    Button {
                        coordinator.navigateToCourseDetail(course)
                    } label: {
                        CourseRowView(course: course)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .navigationTitle("Courses")
        .task { await viewModel.fetchCourses() }
        .refreshable { await viewModel.fetchCourses() }
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}

private struct CourseRowView: View {
    let course: CourseEntity

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(course.title)
                .font(.headline)
            Text(course.description)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}
