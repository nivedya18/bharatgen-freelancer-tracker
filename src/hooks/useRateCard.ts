import { useState, useEffect, useCallback } from 'react';
import { supabase, RateCard, RateCardInsert } from '../lib/supabase';

interface RateCardData {
  linguist_group_a: number;
  linguist_group_b: number;
  expert_group_a: number;
  expert_group_b: number;
}

export const useRateCard = () => {
  const [rates, setRates] = useState<RateCardData>({
    linguist_group_a: 0,
    linguist_group_b: 0,
    expert_group_a: 0,
    expert_group_b: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('rate_card')
        .select('*');

      if (error) throw error;

      // Convert array of rate cards to our structured format
      const rateData: RateCardData = {
        linguist_group_a: 0,
        linguist_group_b: 0,
        expert_group_a: 0,
        expert_group_b: 0,
      };

      if (data) {
        data.forEach((rate: RateCard) => {
          if (rate.freelancer_type === 'Linguist' && rate.group_type === 'Group A') {
            rateData.linguist_group_a = rate.rate;
          } else if (rate.freelancer_type === 'Linguist' && rate.group_type === 'Group B') {
            rateData.linguist_group_b = rate.rate;
          } else if (rate.freelancer_type === 'Language Expert' && rate.group_type === 'Group A') {
            rateData.expert_group_a = rate.rate;
          } else if (rate.freelancer_type === 'Language Expert' && rate.group_type === 'Group B') {
            rateData.expert_group_b = rate.rate;
          }
        });
      }

      setRates(rateData);
      return rateData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rates';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRates = async (newRates: RateCardData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data for upsert
      const rateCards: RateCardInsert[] = [
        {
          freelancer_type: 'Linguist',
          group_type: 'Group A',
          rate: newRates.linguist_group_a,
        },
        {
          freelancer_type: 'Linguist',
          group_type: 'Group B',
          rate: newRates.linguist_group_b,
        },
        {
          freelancer_type: 'Language Expert',
          group_type: 'Group A',
          rate: newRates.expert_group_a,
        },
        {
          freelancer_type: 'Language Expert',
          group_type: 'Group B',
          rate: newRates.expert_group_b,
        },
      ];

      // Upsert all rate cards (insert or update based on unique constraint)
      const { error } = await supabase
        .from('rate_card')
        .upsert(rateCards, {
          onConflict: 'freelancer_type,group_type',
        });

      if (error) throw error;

      setRates(newRates);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save rates';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return {
    rates,
    loading,
    error,
    fetchRates,
    saveRates,
  };
};