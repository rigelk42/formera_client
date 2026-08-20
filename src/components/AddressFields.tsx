import { Form, Input, Select, type FormInstance } from 'antd'
import { getCountryOptions, getStateOptions } from '../lib/locations'

const countryOptions = getCountryOptions()

interface AddressFieldsProps {
  form: FormInstance
  // Field path this address lives under, e.g. ['address'] or
  // ['newCustomer', 'address'].
  name: (string | number)[]
}

export function AddressFields({ form, name }: AddressFieldsProps) {
  const countryPath = [...name, 'country']
  const statePath = [...name, 'state']
  const countryCode = Form.useWatch(countryPath, form) as string | undefined
  const stateOptions = getStateOptions(countryCode)

  return (
    <>
      <Form.Item
        label="Address line 1"
        name={[...name, 'line1']}
        rules={[{ required: true, message: 'Address line 1 is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Address line 2" name={[...name, 'line2']}>
        <Input />
      </Form.Item>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Form.Item
          label="City"
          name={[...name, 'city']}
          rules={[{ required: true, message: 'City is required' }]}
          className="flex-1"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="State"
          name={statePath}
          rules={[{ required: true, message: 'State is required' }]}
          className="flex-1"
        >
          {stateOptions.length > 0 ? (
            <Select
              showSearch
              placeholder="Select a state"
              optionFilterProp="label"
              options={stateOptions}
              disabled={!countryCode}
            />
          ) : (
            <Input disabled={!countryCode} placeholder="State / province" />
          )}
        </Form.Item>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Form.Item
          label="Postal code"
          name={[...name, 'postal_code']}
          rules={[{ required: true, message: 'Postal code is required' }]}
          className="flex-1"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Country"
          name={countryPath}
          rules={[{ required: true, message: 'Country is required' }]}
          className="flex-1"
        >
          <Select
            showSearch
            placeholder="Select a country"
            optionFilterProp="label"
            options={countryOptions}
            onChange={() => form.setFieldValue(statePath, undefined)}
          />
        </Form.Item>
      </div>
    </>
  )
}
