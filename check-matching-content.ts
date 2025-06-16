import { db } from "./server/db";
import { matching, content, images } from "./shared/schema";
import { eq, or } from "drizzle-orm";

async function checkMatchingContent() {
  console.log("🔍 Checking matching content availability...");
  
  // Get a few matching activities to analyze
  const matchingActivities = await db.select().from(matching).limit(5);
  
  for (const activity of matchingActivities) {
    console.log(`\n📋 Activity ${activity.id}: ${activity.topic}`);
    console.log(`Type: ${activity.type}`);
    
    const contentIds = [];
    for (let i = 1; i <= 6; i++) {
      const contentId = activity[`prompt${i}` as keyof typeof activity];
      if (contentId) {
        contentIds.push(contentId);
      }
    }
    
    console.log(`Content IDs found: ${contentIds.length} out of 6`);
    console.log(`IDs: ${contentIds.join(', ')}`);
    
    // Check each content item
    let validPictureTitle = 0;
    let validTitleDescription = 0;
    
    for (const contentId of contentIds) {
      const contentItem = await db.select().from(content).where(eq(content.id, contentId));
      
      if (contentItem.length > 0) {
        const item = contentItem[0];
        
        // Check for picture-title matching
        const image = await db.select().from(images).where(
          or(
            eq(images.contentid, contentId),
            eq(images.id, item.imageid || '')
          )
        );
        
        const hasValidImage = image.length > 0 && image[0].imagelink;
        const hasValidTitle = item.title && item.title.trim();
        
        if (hasValidImage && hasValidTitle) {
          validPictureTitle++;
        }
        
        // Check for title-description matching
        const hasValidDescription = item.short_description && item.short_description.trim();
        
        if (hasValidTitle && hasValidDescription) {
          validTitleDescription++;
        }
        
        console.log(`  Content ${contentId}: title=${!!hasValidTitle}, image=${!!hasValidImage}, desc=${!!hasValidDescription}`);
      } else {
        console.log(`  Content ${contentId}: ❌ NOT FOUND`);
      }
    }
    
    console.log(`Valid picture-title pairs: ${validPictureTitle}`);
    console.log(`Valid title-description pairs: ${validTitleDescription}`);
  }
}

checkMatchingContent().catch(console.error);