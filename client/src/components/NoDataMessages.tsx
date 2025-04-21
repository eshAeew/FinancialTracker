import { useTranslation } from "react-i18next";

export function NoExpenseData() {
  const { t } = useTranslation();
  return <div className="text-muted-foreground">{t('analytics.noExpenseData')}</div>;
}

export function NoIncomeData() {
  const { t } = useTranslation();
  return <div className="text-muted-foreground">{t('analytics.noIncomeData')}</div>;
}

export function NoTransactionData() {
  const { t } = useTranslation();
  return <div className="text-center py-10 text-muted-foreground">
    {t('analytics.noTransactionData')}
  </div>;
}