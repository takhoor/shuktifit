const BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export function getExerciseImageUrl(imagePath: string): string {
  return `${BASE_URL}/${imagePath}`;
}
