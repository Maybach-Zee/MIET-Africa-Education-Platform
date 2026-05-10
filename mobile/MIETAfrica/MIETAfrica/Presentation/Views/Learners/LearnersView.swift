import SwiftUI

struct LearnersView: View {
    @Environment(LearnersCoordinator.self) private var coordinator
    @State private var viewModel = LearnersViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.learners.isEmpty {
                ContentUnavailableView("No Learners", systemImage: "person.2")
            } else {
                List(viewModel.learners) { learner in
                    Button {
                        coordinator.navigateToLearnerDetail(learner)
                    } label: {
                        LearnerRowView(learner: learner)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .navigationTitle("Learners")
        .searchable(text: $viewModel.searchQuery)
        .task { await viewModel.fetchLearners() }
        .refreshable { await viewModel.fetchLearners() }
    }
}

private struct LearnerRowView: View {
    let learner: LearnerEntity

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "person.crop.circle.fill")
                .font(.title2)
                .foregroundStyle(.secondary)
            VStack(alignment: .leading) {
                Text("\(learner.firstName) \(learner.lastName)")
                    .font(.headline)
                Text(learner.email)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
