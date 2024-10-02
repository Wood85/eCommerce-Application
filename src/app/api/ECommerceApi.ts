import IAPIClientDetails from '../interfaces/APIClientDetails.interface';
import IAccessToken from '../interfaces/AccessToken.interface';
import IAddShippingAddressID from '../interfaces/AddShippingAddressID.interface';
import { ICart, IDiscount, IRemoveItemBodyRequest } from '../interfaces/Cart.interface';
import ICustomerData from '../interfaces/CustomerData.interface';
import ICustomerProfile from '../interfaces/CustomerProfile.interface';
import ICustomerSignInResult from '../interfaces/CustomerSignInResult.interface';
import ICustomerUpdateRequest from '../interfaces/CustomerUpdateRequest.interface';
import { ICategories, IProducts, IQueryProducts } from '../interfaces/Product.interface';
import ITokenPassword from '../interfaces/TokenPassword.interface';
import IUpdateAddress from '../interfaces/UpdateAddress.interface';
import { TActions, TCustomerData, TCustomerPassword } from '../interfaces/UpdateCustomerInfo.interface';
import { CARDS_PER_PAGE, DEFAULT_PAGE_NUMBER } from '../utils/constants';

class ECommerceApi {
  static async getAccessToken(clientDetails: IAPIClientDetails): Promise<IAccessToken> {
    const basicAuthData = btoa(`${clientDetails.clientId}:${clientDetails.secret}`);
    const response = await fetch(`${clientDetails.AuthURL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuthData}`,
      },
      body: `grant_type=client_credentials&scope=${clientDetails.scope}`,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getAnonymousToken(clientDetails: IAPIClientDetails): Promise<ITokenPassword> {
    const uniqueId = self.crypto.randomUUID();
    const basicAuthData = btoa(`${clientDetails.clientId}:${clientDetails.secret}`);
    const { scope } = clientDetails;
    const response = await fetch(`${clientDetails.AuthURL}/oauth/${clientDetails.projectKey}/anonymous/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuthData}`,
      },
      body: `grant_type=client_credentials&scope=${scope}&anonymous_id=${uniqueId}`,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getTokenPassword(
    clientDetails: IAPIClientDetails,
    data: { email: string; password: string },
  ): Promise<ITokenPassword> {
    const basicAuthData = btoa(`${clientDetails.clientId}:${clientDetails.secret}`);
    const response = await fetch(`${clientDetails.AuthURL}/oauth/${clientDetails.projectKey}/customers/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuthData}`,
      },
      body: `grant_type=password&username=${data.email}&password=${data.password}&scope=${clientDetails.scope}`,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async createCustomer(
    clientDetails: IAPIClientDetails,
    token: string,
    customerData: ICustomerData,
  ): Promise<ICustomerSignInResult> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.json();
      const errorMessage = errorText.message;
      throw new Error(errorMessage);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async authCustomer(
    clientDetails: IAPIClientDetails,
    data: ICustomerData,
    token: string,
  ): Promise<ICustomerSignInResult> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        anonymousCart: data.anonymousCart!,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getCustomer(clientDetails: IAPIClientDetails, token: string): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async updateCustomer(
    clientDetails: IAPIClientDetails,
    requestDetails: ICustomerUpdateRequest,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'addAddress',
            address: {
              streetName: requestDetails.address.streetName,
              streetNumber: requestDetails.address.streetNumber,
              postalCode: requestDetails.address.postalCode,
              city: requestDetails.address.city,
              country: requestDetails.address.country,
            },
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async addShippingAddressID(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'addShippingAddressId',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async addBillingAddressID(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'addBillingAddressId',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async removeShippingAddressID(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'removeShippingAddressId',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async removeBillingAddressID(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'removeBillingAddressId',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async setDefaultShippingAddress(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'setDefaultShippingAddress',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async setDefaultBillingAddress(
    clientDetails: IAPIClientDetails,
    requestDetails: IAddShippingAddressID,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${requestDetails.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestDetails.token}`,
      },
      body: JSON.stringify({
        version: requestDetails.version,
        actions: [
          {
            action: 'setDefaultBillingAddress',
            addressId: requestDetails.addressId,
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getAllProducts(clientDetails: IAPIClientDetails, token: string): Promise<IQueryProducts> {
    const path = 'products?limit=100';
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getProducts(
    clientDetails: IAPIClientDetails,
    token: string,
    pageNumber: number = DEFAULT_PAGE_NUMBER,
  ): Promise<IQueryProducts> {
    const ONE = 1;
    const path = 'products?limit=12&offset=';
    const response = await fetch(
      `${clientDetails.APIURL}/${clientDetails.projectKey}/${path}${CARDS_PER_PAGE * (pageNumber - ONE)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getProductByID(clientDetails: IAPIClientDetails, token: string, id: string): Promise<IProducts> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getCategories(clientDetails: IAPIClientDetails, token: string): Promise<ICategories> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getSelectedProducts(
    clientDetails: IAPIClientDetails,
    token: string,
    categoryId: string,
    pageNumber: number = DEFAULT_PAGE_NUMBER,
  ): Promise<IQueryProducts> {
    const ONE = 1;
    const path = `/product-projections/search?filter=categories.id:subtree("${categoryId}")&limit=12&offset=`;
    const response = await fetch(
      `${clientDetails.APIURL}/${clientDetails.projectKey}${path}${CARDS_PER_PAGE * (pageNumber - ONE)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getPriceRange(
    clientDetails: IAPIClientDetails,
    token: string,
    min: number,
    max: number,
  ): Promise<ICategories> {
    const path = `/product-projections/search?filter=variants.price.centAmount:range (${min} to ${max})`;
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getSorting(
    clientDetails: IAPIClientDetails,
    token: string,
    sortBy: string,
    sortRule: string,
    categoryID?: string | null,
  ): Promise<ICategories> {
    const path = categoryID
      ? `/product-projections/search?filter=categories.id:"${categoryID}"&sort=${sortBy} ${sortRule}`
      : `/product-projections/search?sort=${sortBy} ${sortRule}`;
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}${path}&limit=12&offset=12`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getSearching(
    clientDetails: IAPIClientDetails,
    token: string,
    inputRes: string,
    pageNumber: number,
  ): Promise<IQueryProducts> {
    const ONE = 1;
    const path = `/product-projections/search?text.en=${inputRes}&limit=12&offset=`;
    const response = await fetch(
      `${clientDetails.APIURL}/${clientDetails.projectKey}${path}${CARDS_PER_PAGE * (pageNumber - ONE)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getProductsByBrand(
    clientDetails: IAPIClientDetails,
    token: string,
    brandName: string,
    pageNumber: number = DEFAULT_PAGE_NUMBER,
  ): Promise<IQueryProducts> {
    const ONE = 1;
    const searchByBrand = `text.en="${brandName}`;
    const productsLimitPerPage = `limit=12&offset=${CARDS_PER_PAGE * (pageNumber - ONE)}`;
    const path = `/product-projections/search?${searchByBrand}&${productsLimitPerPage}`;

    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  private static getActionsVariant(customerData: TCustomerData): TActions[] {
    const result = [];
    let actions: TActions = { action: '' };
    const resetActions = (): void => {
      actions = { action: '' };
    };
    if (customerData.newUserInfo.newEmailAddress) {
      actions.action = 'changeEmail';
      actions.email = customerData.newUserInfo.newEmailAddress;
      result.push(actions);
      resetActions();
    }
    if (customerData.newUserInfo.newFirstName) {
      actions.action = 'setFirstName';
      actions.firstName = customerData.newUserInfo.newFirstName;
      result.push(actions);
      resetActions();
    }
    if (customerData.newUserInfo.newLastName) {
      actions.action = 'setLastName';
      actions.lastName = customerData.newUserInfo.newLastName;
      result.push(actions);
      resetActions();
    }
    if (customerData.newUserInfo.newDateOfBirth) {
      actions.action = 'setDateOfBirth';
      actions.dateOfBirth = customerData.newUserInfo.newDateOfBirth;
      result.push(actions);
      resetActions();
    }
    return result;
  }

  static async updateCustomerData(
    clientDetails: IAPIClientDetails,
    token: string,
    customerData: TCustomerData,
  ): Promise<ICustomerProfile> {
    const actions = ECommerceApi.getActionsVariant(customerData);
    const response = await fetch(
      `${clientDetails.APIURL}/${clientDetails.projectKey}/customers/${customerData.customerID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          version: customerData.version,
          actions: actions.map((el) => el),
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async updateCustomerPassword(
    clientDetails: IAPIClientDetails,
    token: string,
    customerData: TCustomerPassword,
  ): Promise<ICustomerProfile> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: customerData.customerID,
        version: customerData.version,
        currentPassword: customerData.newPassword.currentPassword,
        newPassword: customerData.newPassword.newPassword,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getCart(clientDetails: IAPIClientDetails, token: string, cartId: string): Promise<string | ICart> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/carts/${cartId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return 'cart with this ID does not exist';
    }

    const json = await response.json();
    return json;
  }

  static async createCart(clientDetails: IAPIClientDetails, token: string, shipping?: IUpdateAddress): Promise<ICart> {
    let bodyRequest;
    if (!shipping) {
      bodyRequest = { currency: 'USD' };
    }
    if (shipping) {
      bodyRequest = {
        currency: 'USD',
        streetName: shipping.streetName,
        streetNumber: shipping.streetNumber,
        postalCode: shipping.postalCode,
        city: shipping.city,
        country: shipping.country,
      };
    }
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyRequest),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async getHasCart(clientDetails: IAPIClientDetails, token: string): Promise<boolean> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.results[0]) {
      return false;
    }
    return true;
  }

  static async checkCartExistsByCustomerID(
    clientDetails: IAPIClientDetails,
    token: string,
    customer: string,
  ): Promise<ICart> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/carts/customer-id=${customer}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const json = await response.json();
      return json;
    }
  }

  static async addItemToCart(
    clientDetails: IAPIClientDetails,
    token: string,
    cartId: string,
    version: number,
    itemId: string,
  ): Promise<ICart> {
    return fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'addLineItem',
            productId: itemId,
            variantId: 1,
            quantity: 1,
          },
        ],
      }),
    }).then((response) => {
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return false;
      }
      return response.json();
    });
  }

  static async setShippingAddressToCart(
    clientDetails: IAPIClientDetails,
    token: string,
    cartId: string,
    version: number,
    address: IUpdateAddress,
  ): Promise<ICart> {
    return fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'setShippingAddress',
            address: {
              streetName: address.streetName,
              streetNumber: address.streetNumber,
              postalCode: address.postalCode,
              city: address.city,
              country: address.country,
            },
          },
        ],
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  static async removeItemFromCart(
    clientDetails: IAPIClientDetails,
    token: string,
    cartId: string,
    version: number,
    lineItemId: string,
  ): Promise<ICart> {
    return fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'removeLineItem',
            lineItemId,
          },
        ],
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  static async changeLineItemQuantity(
    clientDetails: IAPIClientDetails,
    token: string,
    cartId: string,
    version: number,
    lineItemId: string,
    quantity: number,
  ): Promise<ICart> {
    return fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        actions: [
          {
            action: 'changeLineItemQuantity',
            lineItemId,
            quantity,
          },
        ],
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  static async removeAllItemsFromCart(
    clientDetails: IAPIClientDetails,
    token: string,
    cartId: string,
    version: number,
    actionsItems: IRemoveItemBodyRequest[],
  ): Promise<ICart> {
    return fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/me/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
        actions: actionsItems,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  static async getDiscountCode(clientDetails: IAPIClientDetails, token: string): Promise<IDiscount> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/discount-codes`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  }

  static async getCartDiscount(clientDetails: IAPIClientDetails, token: string): Promise<IDiscount> {
    const response = await fetch(`${clientDetails.APIURL}/${clientDetails.projectKey}/cart-discounts`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  }
}

export default ECommerceApi;
