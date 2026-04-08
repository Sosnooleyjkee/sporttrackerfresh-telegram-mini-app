import { foodCatalogSeed } from "@/constants/foodCatalog";
import { workoutTemplates } from "@/constants/workoutTemplates";

export function buildSeedStatements() {
  const templateRows = Object.values(workoutTemplates).flat().map((item) => `
    INSERT OR IGNORE INTO exercise_templates
    (id, group_name, name, sort_order, default_weight, default_reps, default_sets)
    VALUES ('${item.id}', '${item.direction}', '${item.name}', ${item.order}, ${item.defaultWeight}, ${item.defaultReps}, ${item.defaultSets});
  `);

  const foodRows = foodCatalogSeed.map((item) => `
    INSERT OR IGNORE INTO food_catalog
    (id, name, category, kcal_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
    VALUES ('${item.id}', '${item.name}', '${item.category}', ${item.kcalPer100g}, ${item.proteinPer100g}, ${item.fatPer100g}, ${item.carbsPer100g});
  `);

  return [...templateRows, ...foodRows].join("\n");
}
