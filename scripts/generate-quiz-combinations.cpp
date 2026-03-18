#include <iostream>
#include <fstream>
#include <cstring>
#include <chrono>
#include <iomanip>

const long long TOTAL_COMBINATIONS = 244140625LL; // 5^12
const int QUESTIONS = 12;
const int CHOICES = 5;
const int BUFFER_SIZE = 1024 * 1024; // 1MB buffer for efficient writes
const long long PROGRESS_INTERVAL = 5000000; // Log every 5M combos

int main() {
    auto start_time = std::chrono::high_resolution_clock::now();
    
    std::cout << "🎯 Generating " << TOTAL_COMBINATIONS << " quiz answer combinations..." << std::endl;
    std::cout << "ℹ️  5^12 combinations, each representing a unique way to answer 12 questions" << std::endl;
    std::cout << "📁 Output: src/test/fixtures/quiz_answer_combinations.csv" << std::endl << std::endl;
    
    // Open output file
    std::ofstream out("src/test/fixtures/quiz_answer_combinations.csv");
    if (!out.is_open()) {
        std::cerr << "❌ Error: Could not open output file" << std::endl;
        return 1;
    }
    
    // Set buffer for faster I/O
    char buffer[BUFFER_SIZE];
    out.rdbuf()->pubsetbuf(buffer, BUFFER_SIZE);
    
    // Write header
    out << "a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12\n";
    
    // Generate all combinations
    for (long long index = 0; index < TOTAL_COMBINATIONS; ++index) {
        long long remaining = index;
        
        // Convert index to base-5 representation and write as CSV
        for (int q = 0; q < QUESTIONS; ++q) {
            if (q > 0) out << ',';
            out << (remaining % CHOICES);
            remaining /= CHOICES;
        }
        out << '\n';
        
        // Progress logging
        if ((index + 1) % PROGRESS_INTERVAL == 0) {
            auto now = std::chrono::high_resolution_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - start_time).count();
            double elapsed_seconds = elapsed / 1000.0;
            double rate = (index + 1) / elapsed_seconds;
            long long remaining_total = TOTAL_COMBINATIONS - (index + 1);
            double eta_seconds = remaining_total / rate;
            double eta_minutes = eta_seconds / 60.0;
            
            std::cout << "✓ Generated " << (index + 1) << " combinations | "
                      << std::fixed << std::setprecision(0)
                      << rate << " combos/sec | "
                      << "ETA: " << std::fixed << std::setprecision(1)
                      << eta_minutes << " minutes remaining" << std::endl;
        }
    }
    
    out.close();
    
    // Calculate final stats
    auto end_time = std::chrono::high_resolution_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time).count();
    double elapsed_seconds = elapsed / 1000.0;
    
    // Get file size
    std::ifstream check("src/test/fixtures/quiz_answer_combinations.csv", std::ios::ate);
    long file_size = check.tellg();
    check.close();
    double file_size_mb = file_size / 1024.0 / 1024.0;
    
    std::cout << std::endl;
    std::cout << "✅ Done! Generated " << TOTAL_COMBINATIONS << " combinations in "
              << std::fixed << std::setprecision(1) << elapsed_seconds << "s" << std::endl;
    std::cout << "📊 File size: " << std::fixed << std::setprecision(1) << file_size_mb << " MB" << std::endl << std::endl;
    std::cout << "Next step: Score all combinations using calculateScores()" << std::endl;
    
    return 0;
}
