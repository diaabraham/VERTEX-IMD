import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

interface Asset {
  id: number
  asset_id: string
  asset_type: string
  status: string
  estimated_condition: number
  maintenance_cost: number
}

async function fetchAssets(): Promise<Asset[]> {
  const response = await axios.get('/api/assets/')
  return response.data
}

export default function AssetList() {
  const { data: assets, isLoading, error } = useQuery<Asset[], Error>(['assets'], fetchAssets)

  if (isLoading) return <div className="text-center">Loading...</div>
  if (error) return <div className="text-center text-red-500">Error: {error.message}</div>

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {assets?.map((asset) => (
          <li key={asset.id}>
            <a href="#" className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{asset.asset_type}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      asset.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      ID: {asset.asset_id}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Condition: {asset.estimated_condition.toFixed(2)}</p>
                    <p className="ml-4">Cost: ${asset.maintenance_cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}