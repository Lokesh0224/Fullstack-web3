import basicSetup from '../wallet-setup/basic.setup';
import { testWithSynpress } from '@synthetixio/synpress';
import { EthereumWalletMock, MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';

/*This metaMaskFixtures function is going to take the basicSetup from basic.setup.ts and 
use the below to create metamask and add this metaMaskFixtures function to the testWithSynpress
from where we'll get this test keyword
*/
const test = testWithSynpress(metaMaskFixtures(basicSetup))
/* below we are gonna extract expect from the test we got */
const { expect }= test


test('has title', async ({ page }) => {
  await page.goto('/');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/);
});

/* below all the parameter we've got from the test */
test('should show the airdropform when connected, otherwise, not', async ({page, context, metamaskPage, extensionId}) => {
  await page.goto('/');
  //check we see 'Please connect wallet
  await expect(page.getByText('Please connect')).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId) //metmask object
  /*the wallectconnect connect button has data-testid and that is 'rk-connect-button*/
  await page.getByTestId('rk-connect-button').click()//this basically says the test to click connect button
  await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
    state: 'visible', //after clicking connect wallet the different wallet options will be visible
    timeout: 60000 //this is for when we click the connect wallet button it takes time to pop up
  })
  await page.getByTestId("rk-wallet-option-io.metamask").click()
  
  await metamask.connectToDapp()//this will connect to metamask wallet

  const customNetwork = {
    name: 'Anvil', 
    rpcUrl: 'http://127.0.0.1:8545', 
    chainId: 31337, 
    symbol: 'ETH'
  }
  await metamask.addNetwork(customNetwork)

  await expect(page.getByText("Token Address")).toBeVisible()
})