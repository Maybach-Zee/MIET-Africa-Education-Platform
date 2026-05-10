import SwiftUI

struct AttendanceView: View {
    @Environment(AttendanceCoordinator.self) private var coordinator
    @State private var viewModel = AttendanceViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.records.isEmpty {
                ContentUnavailableView("No Records", systemImage: "checkmark.circle")
            } else {
                List(viewModel.records) { record in
                    AttendanceRowView(record: record)
                }
            }
        }
        .navigationTitle("Attendance")
        .task { await viewModel.fetchRecords() }
        .refreshable { await viewModel.fetchRecords() }
    }
}

private struct AttendanceRowView: View {
    let record: AttendanceRecordEntity

    var body: some View {
        HStack {
            Image(systemName: record.isPresent ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(record.isPresent ? .green : .red)
            VStack(alignment: .leading) {
                Text(record.learnerId)
                    .font(.headline)
                Text(record.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
