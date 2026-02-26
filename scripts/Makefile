# Makefile for quiz answer combination generator

CXX = clang++
CXXFLAGS = -O3 -std=c++17 -Wall -Wextra
TARGET = generate-quiz-combinations
SOURCE = generate-quiz-combinations.cpp
OUTPUT_FILE = ../src/test/fixtures/quiz_answer_combinations.csv

.PHONY: build run clean help all

all: build

build: $(TARGET)
	@echo "✅ Build complete: ./$(TARGET)"

$(TARGET): $(SOURCE)
	@echo "🔨 Compiling $(SOURCE)..."
	$(CXX) $(CXXFLAGS) $< -o $@

run: build
	@echo "🚀 Running generator..."
	./$(TARGET)

compress:
	@echo "📦 Compressing CSV with gzip..."
	gzip -f ../src/test/fixtures/quiz_answer_combinations.csv
	@echo "✅ Compression complete: ../src/test/fixtures/quiz_answer_combinations.csv.gz"

score: score-quiz-combinations
	@echo "🚀 Scoring all combinations..."
	./score-quiz-combinations

score-quiz-combinations: score-quiz-combinations.cpp
	@echo "🔨 Compiling score-quiz-combinations.cpp..."
	$(CXX) $(CXXFLAGS) score-quiz-combinations.cpp -o score-quiz-combinations -lz

analyze: analyze-archetype-distribution
	@echo "🚀 Analyzing archetype distribution..."
	./analyze-archetype-distribution

analyze-archetype-distribution: analyze-archetype-distribution.cpp
	@echo "🔨 Compiling analyze-archetype-distribution.cpp..."
	$(CXX) $(CXXFLAGS) analyze-archetype-distribution.cpp -o analyze-archetype-distribution

clean:
	@echo "🧹 Cleaning up..."
	rm -f $(TARGET)
	rm -f score-quiz-combinations
	rm -f $(OUTPUT_FILE)
	rm -f ../src/test/fixtures/quiz_results.csv
	rm -f ../src/test/fixtures/quiz_results_stats.json
	@echo "✅ Clean complete"

verify-build:
	@if [ -f $(TARGET) ]; then \
		echo "✅ Executable exists"; \
	else \
		echo "❌ Executable not found. Run 'make build' first"; \
		exit 1; \
	fi

help:
	@echo "Quiz Fixture Generation & Scoring - Makefile targets:"
	@echo ""
	@echo "  make build      - Compile the combination generator"
	@echo "  make run        - Generate all 244M combinations"
	@echo "  make compress   - gzip the CSV file"
	@echo "  make score      - Compile and run the scorer (requires compressed CSV)"
	@echo "  make analyze    - Compile and run archetype distribution analyzer"
	@echo "  make clean      - Remove compiled binaries and output files"
	@echo "  make help       - Show this help message"
	@echo ""
	@echo "Workflow:"
	@echo "  make run        # Step 1: Generate combinations (211s)"
	@echo "  make compress   # Step 1b: Compress CSV (45s)"
	@echo "  make score      # Step 2: Score all combinations (135s)"
	@echo "  make analyze    # Step 3: Analyze distribution (X min)"
	@echo ""
	@echo "Outputs:"
	@echo "  quiz_answer_combinations.csv       - All 244M answer paths"
	@echo "  quiz_answer_combinations.csv.gz    - Compressed version (440MB)"
	@echo "  quiz_results.csv                   - Scoring results"
	@echo "  quiz_results_stats.json            - Tie statistics"
