/**
 * Dynamic block — markup is produced by render.php at request time,
 * so save() intentionally returns null. This is what lets us evolve
 * the frontend HTML without block deprecations.
 */
export default function save() {
	return null;
}
