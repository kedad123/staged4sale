// Simple validation script for portfolio system
async function validatePortfolio() {
    console.log('🔍 Validating portfolio system...');
    
    try {
        // Test 1: Check if projects.md exists and is readable
        console.log('📋 Testing projects.md...');
        const projectsResponse = await fetch('images/projects/projects.md');
        if (!projectsResponse.ok) {
            throw new Error('projects.md not found or not readable');
        }
        const projectsText = await projectsResponse.text();
        console.log('✅ projects.md loaded successfully');
        console.log('   Content:', projectsText.trim());
        
        // Test 2: Parse project slugs
        const slugs = [];
        const lines = projectsText.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && trimmed.startsWith('- ')) {
                const slug = trimmed.substring(2).trim();
                if (slug) slugs.push(slug);
            }
        }
        console.log('📝 Found project slugs:', slugs);
        
        // Test 3: Check each project file
        console.log('🗂️ Testing individual project files...');
        for (const slug of slugs) {
            try {
                const projectResponse = await fetch(`images/projects/${slug}/${slug}.md`);
                if (!projectResponse.ok) {
                    console.warn(`⚠️ Failed to load ${slug}.md`);
                    continue;
                }
                const projectText = await projectResponse.text();
                console.log(`✅ ${slug}.md loaded successfully`);
                
                // Parse basic info
                const titleMatch = projectText.match(/^# (.+)$/m);
                const locationMatch = projectText.match(/^location:\s*(.+)$/m);
                const featuredMatch = projectText.match(/^featured:\s*(.+)$/m);
                
                if (titleMatch && locationMatch && featuredMatch) {
                    console.log(`   Title: ${titleMatch[1]}`);
                    console.log(`   Location: ${locationMatch[1]}`);
                    console.log(`   Featured: ${featuredMatch[1]}`);
                }
            } catch (error) {
                console.error(`❌ Error loading ${slug}:`, error);
            }
        }
        
        console.log('🎉 Portfolio validation complete!');
        
    } catch (error) {
        console.error('❌ Portfolio validation failed:', error);
    }
}

// Run validation when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', validatePortfolio);
} else {
    validatePortfolio();
}