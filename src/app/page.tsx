import styles from "./page.module.scss";
import SearchBar from "./components/search"
import SearchResults from "./components/results";

export default function Home() {
  return (
    <div className={styles.page}>
      <SearchBar/>
      <SearchResults/>
    </div>
  );
}
