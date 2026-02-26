#include <iostream>
#include <fstream>
#include <map>
#include <vector>
#include <string>
#include <algorithm>
#include <chrono>
#include <iomanip>

const int BUFFER_SIZE = 256;
const long long PROGRESS_INTERVAL = 10000000;

struct ArchetypeStats {
    std::string id;
    long long primaryCount = 0;
    long long secondaryCount = 0;
};

int main() {
    auto start_time = std::chrono::high_resolution_clock::now();
    
    std::cout << "🎯 Analyzing archetype distribution across 244M combinations..." << std::endl;
    std::cout << "📁 Input: ../src/test/fixtures/quiz_results.csv" << std::endl << std::endl;
    
    // Map to store counts
    std::map<std::string, ArchetypeStats> stats;
    
    // Initialize all 12 archetypes
    std::vector<std::string> archetypeIds = {
        "orchestrator", "generalist", "researcher", "experimentalist",
        "director", "disruptor", "educator", "connector",
        "improviser", "advocate", "multidisciplinary", "idealist"
    };
    
    for (const auto& id : archetypeIds) {
        stats[id] = {id, 0, 0};
    }
    
    std::ifstream infile("../src/test/fixtures/quiz_results.csv");
    if (!infile.is_open()) {
        std::cerr << "❌ Error: Could not open input file" << std::endl;
        return 1;
    }
    
    char line[BUFFER_SIZE];
    long long lineNum = 0;
    
    // Skip header
    infile.getline(line, BUFFER_SIZE);
    
    while (infile.getline(line, BUFFER_SIZE)) {
        lineNum++;
        
        // Parse CSV: combo_index,primary,secondary
        char* p = line;
        
        // Skip combo_index
        while (*p && *p != ',') p++;
        if (!*p) continue;
        p++; // Skip comma
        
        // Extract primary archetype
        char* primary_start = p;
        while (*p && *p != ',') p++;
        int primary_len = p - primary_start;
        std::string primary(primary_start, primary_len);
        
        if (!*p) continue;
        p++; // Skip comma
        
        // Extract secondary archetype
        char* secondary_start = p;
        while (*p && *p != '\n' && *p != '\r') p++;
        int secondary_len = p - secondary_start;
        std::string secondary(secondary_start, secondary_len);
        
        // Update counts
        if (stats.count(primary)) {
            stats[primary].primaryCount++;
        }
        if (stats.count(secondary)) {
            stats[secondary].secondaryCount++;
        }
        
        // Progress logging
        if (lineNum % PROGRESS_INTERVAL == 0) {
            auto now = std::chrono::high_resolution_clock::now();
            auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - start_time).count();
            double elapsed_seconds = elapsed / 1000.0;
            double rate = lineNum / elapsed_seconds;
            const long long TOTAL = 244140625;
            long long remaining = TOTAL - lineNum;
            double eta_seconds = remaining / rate;
            double eta_minutes = eta_seconds / 60.0;
            
            std::cout << "✓ Analyzed " << lineNum << " combinations | "
                      << std::fixed << std::setprecision(0)
                      << rate << " rows/sec | "
                      << "ETA: " << std::fixed << std::setprecision(1)
                      << eta_minutes << " minutes remaining" << std::endl;
        }
    }
    
    infile.close();
    
    auto end_time = std::chrono::high_resolution_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time).count();
    double elapsed_seconds = elapsed / 1000.0;
    
    std::cout << std::endl;
    std::cout << "✅ Analysis complete in " << std::fixed << std::setprecision(1) << elapsed_seconds << "s" << std::endl << std::endl;
    
    // Sort by primary count (descending)
    std::vector<ArchetypeStats> sorted_stats;
    for (auto& p : stats) {
        sorted_stats.push_back(p.second);
    }
    std::sort(sorted_stats.begin(), sorted_stats.end(), 
              [](const ArchetypeStats& a, const ArchetypeStats& b) {
                  return a.primaryCount > b.primaryCount;
              });
    
    // Display results
    std::cout << "📊 PRIMARY ARCHETYPE DISTRIBUTION (across 244,140,625 combinations):" << std::endl;
    std::cout << std::string(80, '-') << std::endl;
    std::cout << std::left << std::setw(20) << "Archetype" 
              << std::right << std::setw(15) << "Count" 
              << std::setw(15) << "Percentage" 
              << std::setw(15) << "Per Archetype" << std::endl;
    std::cout << std::string(80, '-') << std::endl;
    
    for (const auto& arch : sorted_stats) {
        double pct = (100.0 * arch.primaryCount) / lineNum;
        double per_type = (double)arch.primaryCount / 12.0;
        std::cout << std::left << std::setw(20) << arch.id
                  << std::right << std::setw(15) << arch.primaryCount
                  << std::setw(15) << std::fixed << std::setprecision(2) << pct << "%"
                  << std::setw(15) << std::fixed << std::setprecision(0) << per_type << std::endl;
    }
    std::cout << std::string(80, '-') << std::endl;
    
    // Secondary distribution
    std::sort(sorted_stats.begin(), sorted_stats.end(), 
              [](const ArchetypeStats& a, const ArchetypeStats& b) {
                  return a.secondaryCount > b.secondaryCount;
              });
    
    std::cout << std::endl;
    std::cout << "📊 SECONDARY ARCHETYPE DISTRIBUTION (across 244,140,625 combinations):" << std::endl;
    std::cout << std::string(80, '-') << std::endl;
    std::cout << std::left << std::setw(20) << "Archetype" 
              << std::right << std::setw(15) << "Count" 
              << std::setw(15) << "Percentage" 
              << std::setw(15) << "Per Archetype" << std::endl;
    std::cout << std::string(80, '-') << std::endl;
    
    for (const auto& arch : sorted_stats) {
        double pct = (100.0 * arch.secondaryCount) / lineNum;
        double per_type = (double)arch.secondaryCount / 12.0;
        std::cout << std::left << std::setw(20) << arch.id
                  << std::right << std::setw(15) << arch.secondaryCount
                  << std::setw(15) << std::fixed << std::setprecision(2) << pct << "%"
                  << std::setw(15) << std::fixed << std::setprecision(0) << per_type << std::endl;
    }
    std::cout << std::string(80, '-') << std::endl;
    
    // Summary stats
    std::cout << std::endl;
    std::cout << "📊 SUMMARY STATISTICS:" << std::endl;
    std::cout << "Total combinations analyzed: " << lineNum << std::endl;
    std::cout << "Average primary per archetype: " << std::fixed << std::setprecision(0) << (double)lineNum / 12.0 << std::endl;
    std::cout << "Average secondary per archetype: " << std::fixed << std::setprecision(0) << (double)lineNum / 12.0 << std::endl;
    
    // Find imbalance
    long long maxPrimary = 0, minPrimary = lineNum;
    for (const auto& p : stats) {
        maxPrimary = std::max(maxPrimary, p.second.primaryCount);
        minPrimary = std::min(minPrimary, p.second.primaryCount);
    }
    
    std::cout << "Max primary count: " << maxPrimary << " (" << std::fixed << std::setprecision(2) 
              << (100.0 * maxPrimary / lineNum) << "%)" << std::endl;
    std::cout << "Min primary count: " << minPrimary << " (" << std::fixed << std::setprecision(2) 
              << (100.0 * minPrimary / lineNum) << "%)" << std::endl;
    std::cout << "Difference: " << (maxPrimary - minPrimary) << " (" << std::fixed << std::setprecision(2)
              << (100.0 * (maxPrimary - minPrimary) / lineNum) << "%)" << std::endl;
    
    return 0;
}
