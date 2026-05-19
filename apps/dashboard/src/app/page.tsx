import { Button, Card } from '@org/ui-shared';
import { APP_NAME } from '@org/utils-shared';
import styles from './page.module.css';

export default function Index() {
  return (
    <main className={styles.main}>
      <Card title={APP_NAME}>
        <p>Dashboard de talleres — fase 1 (estructura inicial).</p>
        <Button variant="primary">Comenzar</Button>
      </Card>
    </main>
  );
}
