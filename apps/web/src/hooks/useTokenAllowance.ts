import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { erc20ABI } from 'wagmi'

import { useQuery } from '@tanstack/react-query'
import { FAST_INTERVAL } from 'config/constants'
import { TransactionType } from 'state/info/types'
import { publicClient } from 'utils/wagmi'

interface BaseTransactionInfo {
  type: TransactionType
}

export interface ApproveTransactionInfo extends BaseTransactionInfo {
  tokenAddress: string
  spender: string
  amount: string
}

function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
): {
  allowance: CurrencyAmount<Token> | undefined
  refetch: () => Promise<any>
} {
  const chainId = 5

  const inputs = useMemo(() => [owner, spender] as [`0x${string}`, `0x${string}`], [owner, spender])

  const { data: allowance, refetch } = useQuery(
    [chainId, token?.address, owner, spender],
    () =>
      publicClient({ chainId }).readContract({
        abi: erc20ABI,
        address: token?.address,
        functionName: 'allowance',
        args: inputs,
      }),
    {
      refetchInterval: FAST_INTERVAL,
      retry: true,
      refetchOnWindowFocus: false,
      enabled: Boolean(spender && owner),
    },
  )

  return useMemo(
    () => ({
      allowance:
        token && typeof allowance !== 'undefined'
          ? CurrencyAmount.fromRawAmount(token, allowance.toString())
          : undefined,
      refetch,
    }),
    [token, refetch, allowance],
  )
}


export default useTokenAllowance
