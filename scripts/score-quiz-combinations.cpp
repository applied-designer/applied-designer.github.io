#include <iostream>
#include <fstream>
#include <cstring>
#include <cmath>
#include <vector>
#include <map>
#include <algorithm>
#include <chrono>
#include <iomanip>
#include <zlib.h>

const long long TOTAL_COMBINATIONS = 244140625LL;
const int QUESTIONS = 12;
const int CHOICES = 5;
const int NUM_ARCHETYPES = 12;
const int NUM_DIMENSIONS = 5;
const long long PROGRESS_INTERVAL = 10000000;
const int GZIP_BUFFER_SIZE = 4 * 1024 * 1024; // 4MB gzip read buffer
const int WRITE_BUFFER_SIZE = 100000; // Batch write every 100k rows
const int LINE_BUFFER_SIZE = 256;

// Archetype dimension profiles from archetypeData.js
struct Archetype {
    std::string id;
    std::string name;
    std::vector<double> dimensions; // [strategy, adaptability, collaboration, experimentation, impact]
    double norm; // Precomputed L2 norm
};

std::vector<Archetype> archetypes = {
    {"orchestrator", "The Orchestrator", {5, 3, 4, 2, 4}, 0.0},
    {"generalist", "The Generalist", {4, 4, 3, 3, 4}, 0.0},
    {"researcher", "The Researcher", {4, 2, 2, 5, 3}, 0.0},
    {"experimentalist", "The Experimentalist", {2, 4, 2, 5, 3}, 0.0},
    {"director", "The Director", {5, 2, 3, 2, 5}, 0.0},
    {"disruptor", "The Disruptor", {3, 3, 2, 5, 4}, 0.0},
    {"educator", "The Educator", {3, 3, 5, 3, 4}, 0.0},
    {"connector", "The Connector", {2, 3, 5, 3, 4}, 0.0},
    {"improviser", "The Improviser", {2, 4, 4, 4, 3}, 0.0},
    {"advocate", "The Advocate", {3, 3, 5, 2, 4}, 0.0},
    {"multidisciplinary", "The Multidisciplinary", {4, 4, 4, 4, 3}, 0.0},
    {"idealist", "The Idealist", {2, 2, 4, 3, 5}, 0.0},
};

// Quiz answer to archetype mapping (from quizData.js)
std::vector<int> quizAnswerToArchetype = {
    0,  // Q1: A1 -> Orchestrator
    1,  // Q1: A2 -> Generalist
    2,  // Q1: A3 -> Researcher
    3,  // Q1: A4 -> Experimentalist
    4,  // Q1: A5 -> Director
    5,  // Q2: A1 -> Disruptor
    6,  // Q2: A2 -> Educator
    7,  // Q2: A3 -> Connector
    8,  // Q2: A4 -> Improviser
    9,  // Q2: A5 -> Advocate
    10, // Q3: A1 -> Multidisciplinary
    11, // Q3: A2 -> Idealist
    0,  // Q3: A3 -> Orchestrator
    1,  // Q3: A4 -> Generalist
    2,  // Q3: A5 -> Researcher
    3,  // Q4: A1 -> Experimentalist
    4,  // Q4: A2 -> Director
    5,  // Q4: A3 -> Disruptor
    6,  // Q4: A4 -> Educator
    7,  // Q4: A5 -> Connector
    8,  // Q5: A1 -> Improviser
    9,  // Q5: A2 -> Advocate
    10, // Q5: A3 -> Multidisciplinary
    11, // Q5: A4 -> Idealist
    0,  // Q5: A5 -> Orchestrator
    1,  // Q6: A1 -> Generalist
    2,  // Q6: A2 -> Researcher
    3,  // Q6: A3 -> Experimentalist
    4,  // Q6: A4 -> Director
    5,  // Q6: A5 -> Disruptor
    6,  // Q7: A1 -> Educator
    7,  // Q7: A2 -> Connector
    8,  // Q7: A3 -> Improviser
    9,  // Q7: A4 -> Advocate
    10, // Q7: A5 -> Multidisciplinary
    11, // Q8: A1 -> Idealist
    0,  // Q8: A2 -> Orchestrator
    1,  // Q8: A3 -> Generalist
    2,  // Q8: A4 -> Researcher
    3,  // Q8: A5 -> Experimentalist
    4,  // Q9: A1 -> Director
    5,  // Q9: A2 -> Disruptor
    6,  // Q9: A3 -> Educator
    7,  // Q9: A4 -> Connector
    8,  // Q9: A5 -> Improviser
    9,  // Q10: A1 -> Advocate
    10, // Q10: A2 -> Multidisciplinary
    11, // Q10: A3 -> Idealist
    0,  // Q10: A4 -> Orchestrator
    1,  // Q10: A5 -> Generalist
    2,  // Q11: A1 -> Researcher
    3,  // Q11: A2 -> Experimentalist
    4,  // Q11: A3 -> Director
    5,  // Q11: A4 -> Disruptor
    6,  // Q11: A5 -> Educator
    7,  // Q12: A1 -> Connector
    8,  // Q12: A2 -> Improviser
    9,  // Q12: A3 -> Advocate
    10, // Q12: A4 -> Multidisciplinary
    11, // Q12: A5 -> Idealist
};

double cosineSimilarity(const std::vector<double>& a, const std::vector<double>& b, double b_norm) {
    double dot = 0, normA = 0;
    for (int i = 0; i < NUM_DIMENSIONS; ++i) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
    }
    if (normA == 0 || b_norm == 0) return 0;
    return dot / (std::sqrt(normA) * b_norm);
}

struct TieResult {
    int primaryCount;
    int secondaryCount;
    int primaryArchetype;
    int secondaryArchetype;
};

TieResult getClosestArchetypesWithTies(const std::vector<double>& dims) {
    std::vector<std::pair<double, int>> similarities;
    for (int i = 0; i < NUM_ARCHETYPES; ++i) {
        similarities.push_back({cosineSimilarity(dims, archetypes[i].dimensions, archetypes[i].norm), i});
    }
    
    std::sort(similarities.rbegin(), similarities.rend());
    
    // Count primary ties
    int primaryCount = 1;
    for (int i = 1; i < NUM_ARCHETYPES; ++i) {
        if (std::abs(similarities[i].first - similarities[0].first) < 1e-9) {
            primaryCount++;
        } else {
            break;
        }
    }
    
    // Count secondary ties (unique secondary archetypes with same similarity)
    int secondaryCount = 1;
    int secondaryIdx = primaryCount;
    if (secondaryIdx < NUM_ARCHETYPES) {
        for (int i = secondaryIdx + 1; i < NUM_ARCHETYPES; ++i) {
            if (std::abs(similarities[i].first - similarities[secondaryIdx].first) < 1e-9) {
                secondaryCount++;
            } else {
                break;
            }
        }
    }
    
    return {
        primaryCount,
        secondaryCount,
        similarities[0].second,
        secondaryIdx < NUM_ARCHETYPES ? similarities[secondaryIdx].second : -1
    };
}

int main() {
    auto start_time = std::chrono::high_resolution_clock::now();
    
    std::cout << "🎯 Scoring " << TOTAL_COMBINATIONS << " quiz answer combinations..." << std::endl;
    std::cout << "📁 Input: src/test/fixtures/quiz_answer_combinations.csv.gz" << std::endl;
    std::cout << "📁 Output: src/test/fixtures/quiz_results.csv" << std::endl << std::endl;
    
    // Precompute archetype norms (optimization #1)
    for (auto& arch : archetypes) {
        double norm = 0;
        for (auto d : arch.dimensions) {
            norm += d * d;
        }
        arch.norm = std::sqrt(norm);
    }
    
    // Open gzip file with larger buffer (optimization #4)
    gzFile infile = gzopen("../src/test/fixtures/quiz_answer_combinations.csv.gz", "rb");
    if (!infile) {
        std::cerr << "❌ Error: Could not open input file" << std::endl;
        return 1;
    }
    gzbuffer(infile, GZIP_BUFFER_SIZE); // Set 4MB buffer
    
    std::ofstream outfile("../src/test/fixtures/quiz_results.csv");
    if (!outfile.is_open()) {
        std::cerr << "❌ Error: Could not open output file" << std::endl;
        gzclose(infile);
        return 1;
    }
    
    // Write header
    outfile << "combo_index,primary_archetype,secondary_archetype\n";
    
    // Tie tracking
    long long noTies = 0;
    long long twoWayPrimary = 0;
    long long threeWayPrimary = 0;
    std::map<int, long long> wayTieCount;
    
    long long lineNum = 0;
    char gzip_buffer[GZIP_BUFFER_SIZE];
    char line_buffer[LINE_BUFFER_SIZE];
    std::string write_buffer; // Batch write buffer (optimization #2)
    write_buffer.reserve(WRITE_BUFFER_SIZE * 100); // Pre-allocate
    
    std::vector<int> answers; // Pre-allocate (optimization #3)
    answers.reserve(QUESTIONS);
    std::vector<double> dims(NUM_DIMENSIONS, 0);
    
    // Skip header line
    gzgets(infile, line_buffer, sizeof(line_buffer));
    
    while (gzgets(infile, line_buffer, sizeof(line_buffer)) != nullptr) {
        lineNum++;
        
        // Fast CSV parsing (optimization #3 - manual character parsing)
        answers.clear();
        int value = 0;
        for (char* p = line_buffer; *p; ++p) {
            if (*p == ',') {
                answers.push_back(value);
                value = 0;
            } else if (*p >= '0' && *p <= '4') {
                value = *p - '0';
            }
        }
        if (value >= 0 && value <= 4) {
            answers.push_back(value);
        }
        
        if (answers.size() != QUESTIONS) continue;
        
        // Calculate dimension scores
        std::fill(dims.begin(), dims.end(), 0);
        for (int q = 0; q < QUESTIONS; ++q) {
            int archetypeIdx = quizAnswerToArchetype[q * CHOICES + answers[q]];
            for (int d = 0; d < NUM_DIMENSIONS; ++d) {
                dims[d] += archetypes[archetypeIdx].dimensions[d];
            }
        }
        
        // Find closest archetypes and track ties
        TieResult result = getClosestArchetypesWithTies(dims);
        
        // Track tie statistics
        wayTieCount[result.primaryCount]++;
        if (result.primaryCount == 1) {
            noTies++;
        } else if (result.primaryCount == 2) {
            twoWayPrimary++;
        } else if (result.primaryCount == 3) {
            threeWayPrimary++;
        }
        
        // Build result line
        char result_line[256];
        snprintf(result_line, sizeof(result_line), "%lld,%s,%s\n", 
                 lineNum - 1, 
                 archetypes[result.primaryArchetype].id.c_str(),
                 result.secondaryArchetype >= 0 ? archetypes[result.secondaryArchetype].id.c_str() : "N/A");
        write_buffer += result_line;
        
        // Batch write (optimization #2)
        if (lineNum % WRITE_BUFFER_SIZE == 0) {
            outfile << write_buffer;
            write_buffer.clear();
        }
        
        // Progress logging
        if (lineNum % PROGRESS_INTERVAL == 0) {
            auto now = std::chrono::high_resolution_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - start_time).count();
            double elapsed_seconds = elapsed / 1000.0;
            double rate = lineNum / elapsed_seconds;
            long long remaining_total = TOTAL_COMBINATIONS - lineNum;
            double eta_seconds = remaining_total / rate;
            double eta_minutes = eta_seconds / 60.0;
            
            std::cout << "✓ Scored " << lineNum << " combinations | "
                      << std::fixed << std::setprecision(0)
                      << rate << " combos/sec | "
                      << "ETA: " << std::fixed << std::setprecision(1)
                      << eta_minutes << " minutes remaining" << std::endl;
        }
    }
    
    // Flush remaining buffer
    if (!write_buffer.empty()) {
        outfile << write_buffer;
    }
    
    gzclose(infile);
    outfile.close();
    
    // Calculate final stats
    auto end_time = std::chrono::high_resolution_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time).count();
    double elapsed_seconds = elapsed / 1000.0;
    
    // Write stats to JSON
    std::ofstream statsfile("../src/test/fixtures/quiz_results_stats.json");
    statsfile << "{\n";
    statsfile << "  \"total_combinations\": " << lineNum << ",\n";
    statsfile << "  \"runtime_seconds\": " << std::fixed << std::setprecision(1) << elapsed_seconds << ",\n";
    statsfile << "  \"combinations_per_second\": " << std::fixed << std::setprecision(0) << (lineNum / elapsed_seconds) << ",\n";
    statsfile << "  \"tie_statistics\": {\n";
    statsfile << "    \"no_ties\": " << noTies << " (" << std::fixed << std::setprecision(2) << (100.0 * noTies / lineNum) << "%),\n";
    
    // Output all N-way tie counts
    bool first = true;
    for (auto& p : wayTieCount) {
        if (!first) statsfile << ",\n";
        statsfile << "    \"" << p.first << "_way_tie\": " << p.second << " (" 
                  << std::fixed << std::setprecision(2) << (100.0 * p.second / lineNum) << "%)";
        first = false;
    }
    
    statsfile << "\n  }\n";
    statsfile << "}\n";
    statsfile.close();
    
    std::cout << std::endl;
    std::cout << "✅ Done! Scored " << lineNum << " combinations in "
              << std::fixed << std::setprecision(1) << elapsed_seconds << "s" << std::endl;
    std::cout << "📊 No ties: " << noTies << " (" << std::fixed << std::setprecision(2) 
              << (100.0 * noTies / lineNum) << "%)" << std::endl;
    std::cout << "📊 2-way primary ties: " << twoWayPrimary << " (" << std::fixed << std::setprecision(2)
              << (100.0 * twoWayPrimary / lineNum) << "%)" << std::endl;
    std::cout << "📊 3-way primary ties: " << threeWayPrimary << " (" << std::fixed << std::setprecision(2)
              << (100.0 * threeWayPrimary / lineNum) << "%)" << std::endl;
    std::cout << "📊 4+ way primary ties: " << (lineNum - noTies - twoWayPrimary - threeWayPrimary) 
              << " (" << std::fixed << std::setprecision(2) 
              << (100.0 * (lineNum - noTies - twoWayPrimary - threeWayPrimary) / lineNum) << "%)" << std::endl;
    std::cout << "\nDetailed tie breakdown in: ../src/test/fixtures/quiz_results_stats.json" << std::endl;
    
    return 0;
}
